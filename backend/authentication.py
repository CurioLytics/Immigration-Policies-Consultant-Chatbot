from flask import Blueprint, jsonify,request
from models import User, TokenBlocklist
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token, 
    jwt_required, 
    get_jwt, 
    current_user,
    get_jwt_identity
)
from extensions import db, limiter, jwt
from datetime import datetime
from datetime import timedelta
import uuid


auth_bp = Blueprint('auth', __name__)

# Class để đại diện cho Guest User (không lưu vào DB)
class GuestUser:
    def __init__(self, guest_id):
        self.guest_id = guest_id
        self.type = "guest"
        # Thuộc tính username và email có thể cần cho một số logic chung,
        # nhưng không phải là thông tin xác thực thực sự cho guest.
        self.username = f"guest_{guest_id[:8]}" 
        self.email = None
        self.id = None # Guest không có ID trong database

@jwt.user_lookup_loader # Đăng ký user_lookup_loader với jwt object
def user_lookup_callback(_jwt_header, jwt_data):
    """
    Callback này được Flask-JWT-Extended sử dụng để tải người dùng 
    từ thông tin trong JWT.
    """
    identity = jwt_data["sub"] # 'sub' claim chứa identity (username hoặc guest_id)
    token_custom_type = jwt_data.get("type") # Claim 'type' tùy chỉnh của chúng ta

    if token_custom_type == "guest":
        # Nếu là guest token, identity chính là guest_id
        return GuestUser(guest_id=identity)
    else:
        # Nếu là token của người dùng đã đăng ký, identity là username
        # current_user sẽ là một instance của User model
        return User.query.filter_by(username=identity).one_or_none()

@auth_bp.post('/register')
@limiter.limit("5 per minute")
def register_user():
    """
    Registers a new user.
    Expects JSON: {"username": "str", "email": "str", "password": "str"}
    Returns:
        201: {"message": "User created"}
        400: {"error": "Missing JSON/fields"} (Implicitly handled by request.get_json())
        403: {"message": "User already exists"}
    """
    data = request.get_json()
    # Basic validation for presence of data
    if not data or not all(key in data for key in ('username', 'email', 'password')) :
        return jsonify({"error": "Missing username, email, or password"}), 400

    user = User.get_user_by_username(data.get('username'))
    if user is not None:
        return jsonify({"message":"User already exists"}), 403
    
    email_exists = User.get_user_by_email(data.get('email'))
    if email_exists is not None:
        return jsonify({"message": "Email already registered"}), 403

    new_user = User(
        username = data.get('username'),
        email = data.get('email'),
    ) 

    new_user.set_password(data.get('password'))
    new_user.save()

    return jsonify({"message":"User created"}), 201

@auth_bp.post('/login')
@limiter.limit("10 per minute; 50 per hour")
def login_user():
    """
    Logs in an existing user.
    Expects JSON: {"identifier": "str (username or email)", "password": "str"}
    Returns:
        200: {"message": "Logged in successfully", "tokens": {"access_token": "str", "refresh_token": "str"}}
        400: {"error": "Missing JSON in request" or "Missing identifier or password"}
        401: {"error": "Invalid credentials"}
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON in request"}), 400

    email = data.get('email') # Sửa: Yêu cầu chỉ dùng email để login
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400 # Sửa thông báo lỗi

    user = User.query.filter(User.email == email).first() # Sửa: Query bằng email

    if user and user.check_password(password):
        # Thêm claim 'type: "registered"' cho user đã đăng ký
        additional_claims = {"type": "registered"}
        access_token = create_access_token(identity=user.username, additional_claims=additional_claims)
        refresh_token = create_refresh_token(identity=user.username, additional_claims=additional_claims) # Cũng thêm type cho refresh

        return jsonify(
            {
                "message": "Logged in successfully",
                "token_type": "registered", # Thêm thông tin loại token
                "tokens": {
                    "access_token": access_token,
                    "refresh_token": refresh_token
                }
            }
        ), 200

    return jsonify({"error": "Invalid credentials"}), 401

@auth_bp.get('/whoami')
@jwt_required()
def who_am_i():
    """
    Protected endpoint to get current user's information.
    Works for both registered users and guest users.
    Requires a valid JWT access token in the Authorization header (Bearer <token>).
    """
    # current_user được tải bởi user_lookup_callback
    # Nó sẽ là một instance của User hoặc GuestUser

    if isinstance(current_user, GuestUser):
        user_info = {
            "guest_id": current_user.guest_id,
            "username": current_user.username, # Tên guest tạm thời
            "type": "guest"
        }
        message = "Guest session details retrieved"
    elif isinstance(current_user, User):
        user_info = {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "type": "registered"
        }
        message = "Registered user details retrieved"
    else:
        # Trường hợp này không nên xảy ra nếu token hợp lệ và user_lookup_loader hoạt động đúng
        return jsonify({"error": "Unknown user type or token issue"}), 500
    
    return jsonify({
        "message": message, 
        "user_info": user_info,
        # "claims": get_jwt() # Bỏ comment nếu muốn xem toàn bộ claims để debug
        }), 200

@auth_bp.get('/refresh')
@jwt_required(refresh=True)
def refresh_token_endpoint():
    """
    Refreshes an access token.
    Requires a valid JWT refresh token in the Authorization header (Bearer <token>).
    Returns:
        200: {"access_token": "str"}
        401: (Handled by Flask-JWT-Extended for missing/invalid/expired refresh token)
    """
    identity = get_jwt_identity()
    # Khi refresh, chúng ta cũng cần biết type của user để tạo access token mới với claim đúng
    # Refresh token cũng nên chứa claim 'type'
    jwt_claims = get_jwt()
    token_custom_type = jwt_claims.get("type") # Lấy 'type' từ refresh token

    additional_claims = {}
    if token_custom_type: # Chỉ thêm nếu type tồn tại trong refresh token
        additional_claims["type"] = token_custom_type
    
    access_token = create_access_token(identity=identity, additional_claims=additional_claims)

    return jsonify({"access_token": access_token}), 200

@auth_bp.get('/logout')
@jwt_required(verify_type=False) # Chấp nhận cả access và refresh token
def logout_user():
    """
    Logs out a user by blocklisting the provided token (for registered users).
    For guest users, client should clear the token.
    Requires a valid JWT access or refresh token.
    """
    token_payload = get_jwt()
    jti = token_payload['jti']
    token_type_from_payload = token_payload['type'] # 'access' hoặc 'refresh' - loại của JWT
    user_custom_type = token_payload.get('type') # Claim 'type' tùy chỉnh: 'guest' hoặc 'registered'
    
    identity = get_jwt_identity() # guest_id cho guest, username cho user

    if user_custom_type == "guest":
        # Đối với guest, logout chủ yếu là client xóa token.
        # Server có thể không cần blocklist JTI để tránh làm đầy DB.
        return jsonify({"message": f"Guest session ended. Client should clear {token_type_from_payload.capitalize()} token."}), 200
    elif user_custom_type == "registered":
        # Đối với user đã đăng ký, tìm user bằng username (identity)
        user = User.query.filter(User.username == identity).first() 
        if not user:
            # Có thể xảy ra nếu token của user đã bị xóa
            return jsonify({"error": "User identity from token not found"}), 400

        revoked_token = TokenBlocklist(
            jti=jti, 
            token_type=token_type_from_payload,
            user_id=user.id, # Sử dụng user.id
            expires_at=datetime.fromtimestamp(token_payload['exp'])
        )
        revoked_token.save()
        return jsonify({"message": f"Successfully logged out. {token_type_from_payload.capitalize()} token revoked."}) , 200
    else:
        # Trường hợp không xác định được loại user từ token (không nên xảy ra)
        return jsonify({"error": "Invalid token: unknown user type claim."}), 400


# Endpoint mới để khởi tạo guest session
@auth_bp.post('/api/v1/guest/session/initiate')
@limiter.limit("20 per minute") # Rate limit cho guest session
def initiate_guest_session():
    """
    Initiates a new guest session and returns a guest JWT.
    This token allows guest users to interact with specific APIs (e.g., chatbot).
    """
    guest_id = str(uuid.uuid4())
    
    # Guest token có thời gian hết hạn ngắn, ví dụ 2 giờ
    expires_delta = timedelta(hours=2) 
    
    # Claim 'type: "guest"' để phân biệt với token của user đã đăng ký.
    # Identity của guest token sẽ là guest_id.
    additional_claims = {"type": "guest"}
    access_token = create_access_token(
        identity=guest_id, 
        expires_delta=expires_delta,
        additional_claims=additional_claims
    )
    
    # Guest không có refresh token
    return jsonify(
        {
            "message": "Guest session initiated successfully",
            "token_type": "guest", # Thông báo rõ đây là guest token
            "access_token": access_token,
            "guest_id": guest_id # Trả về guest_id nếu frontend cần
        }
    ), 200



