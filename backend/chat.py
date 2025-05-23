from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request # Removed jwt_required as guests are allowed, Added verify_jwt_in_request
import os
import google.generativeai as genai
from dotenv import load_dotenv
from models import ChatSession, ChatMessage, User # Added User
from extensions import db
from datetime import datetime, timezone # Added timezone


# Load environment variables
load_dotenv()

chat_bp = Blueprint('chat', __name__)


def _get_user_and_identity():
    """
    Retrieves user identity from JWT token and fetches user details.
    Returns a tuple: (active_user, is_guest, identity_for_logging)
    """
    active_user = None
    is_guest = True
    identity_from_jwt = None
    try:
        identity_from_jwt = get_jwt_identity()
        if identity_from_jwt and identity_from_jwt != 'guest_user':
            active_user = User.query.filter_by(username=identity_from_jwt).first()
            if active_user:
                is_guest = False
            else:
                print(f"Warning: User with identity '{identity_from_jwt}' from JWT not found in database.")
                # Keep identity_from_jwt for logging
        elif identity_from_jwt == 'guest_user':
            identity_from_jwt = 'guest' # Simplify logging
        else: # No identity from JWT
            identity_from_jwt = 'guest_no_jwt'
    except Exception as e:
        print(f"JWT processing exception (treated as guest): {str(e)}")
        identity_from_jwt = 'guest_jwt_error'
    
    # Ensure identity_for_logging always has a value
    identity_for_logging = identity_from_jwt if identity_from_jwt else "guest_unknown_state"
    return active_user, is_guest, identity_for_logging

def _get_ai_response(user_message):
    """
    Generates a response from the AI model.
    Returns the bot's reply string or raises an exception.
    """
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("Error: Gemini API key missing from .env")
        raise ValueError("AI service configuration missing") # Raise an exception to be caught by caller

    genai.configure(api_key=api_key)
    # Consider making model_name configurable
    model_name = os.getenv('GEMINI_MODEL_NAME', 'gemini-2.0-flash-exp') 
    model = genai.GenerativeModel(model_name)
    response = model.generate_content(contents=[user_message])
    return response.text

def _save_chat_interaction(active_user, user_message, bot_reply, current_session_id_int):
    """
    Saves the user and bot messages to the database for a registered user.
    Creates a new session if one doesn't exist or isn't provided.
    Returns the session ID for the response.
    """
    current_chat_session = None
    if current_session_id_int:
        current_chat_session = ChatSession.query.filter_by(id=current_session_id_int, user_id=active_user.id).first()

    if not current_chat_session:
        new_session_title = (user_message[:47] + "...") if len(user_message) > 50 else user_message
        if not new_session_title.strip(): 
            new_session_title = "New Chat"
        
        current_chat_session = ChatSession(user_id=active_user.id, title=new_session_title)
        db.session.add(current_chat_session)
        db.session.flush() # Assigns ID

    session_id_for_response = current_chat_session.id

    user_msg_db = ChatMessage(session_id=current_chat_session.id, sender='user', text=user_message)
    db.session.add(user_msg_db)

    bot_msg_db = ChatMessage(session_id=current_chat_session.id, sender='bot', text=bot_reply)
    db.session.add(bot_msg_db)
    
    # ChatSession.updated_at is handled by onupdate in the model
    db.session.commit()
    print(f"Saved conversation for user '{active_user.username}', session ID {current_chat_session.id}")
    return session_id_for_response

@chat_bp.post('/message')
def handle_message():
    verify_jwt_in_request(optional=True) # Add this line to attempt to load JWT if present
    data = request.get_json()
    user_message = data.get('message')
    requested_session_id_str = data.get('session_id')
    
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    current_session_id_int = None
    if requested_session_id_str:
        try:
            current_session_id_int = int(requested_session_id_str)
        except ValueError:
            pass # Invalid session_id format, treat as if no session_id was provided

    active_user, is_guest, identity_for_logging = _get_user_and_identity()
    
    bot_reply = ""
    try:
        bot_reply = _get_ai_response(user_message)
    except ValueError as e: # Specifically catch config error from _get_ai_response
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"Error generating AI response: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Failed to get AI response"}), 500

    session_id_for_response = None
    if not is_guest and active_user:
        try:
            session_id_for_response = _save_chat_interaction(active_user, user_message, bot_reply, current_session_id_int)
        except Exception as db_error:
            db.session.rollback()
            print(f"Database error for user '{active_user.username}': {str(db_error)}")
            import traceback
            traceback.print_exc()
            # Fallback logic for session_id_for_response if DB save fails
            # This attempts to return a session ID if one was active or provided,
            # even if the latest messages couldn't be saved.
            if current_session_id_int: # If an existing session was being used
                session_id_for_response = current_session_id_int
            # If a new session was being created and flush() failed before assigning an ID,
            # session_id_for_response would remain None, which is acceptable.
            
    elif is_guest and current_session_id_int is not None:
        session_id_for_response = current_session_id_int

    response_data = {"reply": bot_reply}
    if session_id_for_response is not None:
        response_data["session_id"] = session_id_for_response
        
    print(f"User ({identity_for_logging}): {user_message[:100]}...") 
    print(f"Bot: {bot_reply[:100]}...") 

    return jsonify(response_data), 200
