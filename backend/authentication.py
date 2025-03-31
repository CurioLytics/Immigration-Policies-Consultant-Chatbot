from flask import Blueprint, jsonify,request
from models import User, TokenBlocklist
from flask_jwt_extended import (create_access_token, 
                                create_refresh_token, 
                                jwt_required, 
                                get_jwt, 
                                current_user,
                                get_jwt_identity
                                )              


auth_bp = Blueprint('auth', __name__)

@auth_bp.post('/register')
def register_user():
    data = request.get_json()
    user = User.get_user_by_username(data.get('username'))

    if user is not None:
        return jsonify({"message":"User already exists"}), 403
    
    new_user = User(
        username = data.get('username'),
        email = data.get('email'),
    ) 

    new_user.set_password(data.get('password'))
    new_user.save()

    return jsonify({"message":"User created"}), 201

@auth_bp.post('/login')
def login_user():
    data = request.get_json()
    user = User.get_user_by_username(data.get('username'))

    if user and user.check_password(data.get('password')):

        access_token = create_access_token(identity=user.username)
        refresh_token = create_refresh_token(identity=user.username)

        return jsonify(
            {
                "message" : "Logged in successfully",
                "tokens" : {
                    "access_token" : access_token,
                    "refresh_token" : refresh_token
                }
            }
        ), 200

    return jsonify({"error" : "Invalid username or password"}), 400

@auth_bp.get('/whoami')
@jwt_required()
def who_am_i():
    claims = get_jwt()
    return jsonify({"message" : "Testing JWT claims", "User in4" : {"username": current_user.username, "email": current_user.email, "is admin" : claims.get('is_admin')}}), 200

@auth_bp.get('/refresh')
@jwt_required(refresh = True)
def refresh_token():
    identity = get_jwt_identity()
    access_token = create_access_token(identity = identity)

    return jsonify({"Access token": access_token}), 200

@auth_bp.get('/logout')
@jwt_required(verify_type= False)
def logout_user():
    jwt = get_jwt()
    jti = jwt['jti']
    token_type = jwt['type']

    token = TokenBlocklist(jti = jti)

    token.save()

    return jsonify({"message" : f"{token_type} token revoked successfully"}), 200




