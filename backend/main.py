from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, jwt, limiter
from authentication import auth_bp
from users import user_bp
from chat import chat_bp
from chat_history import chat_history_bp
from models import User, TokenBlocklist
from datetime import timedelta
import os

def get_database_uri():
    # Get individual database components from environment variables
    db_user = os.environ.get("POSTGRES_USER", "postgres")
    db_password = os.environ.get("POSTGRES_PASSWORD")

    #change host to db if running in docker
    db_host = os.environ.get("POSTGRES_HOST", "db" if os.environ.get("RUNNING_IN_DOCKER") else "localhost")
    db_port = os.environ.get("POSTGRES_PORT", "5432")
    db_name = os.environ.get("POSTGRES_DB", "Immigration_chatbot_db")
    
    # Check if password is provided
    if not db_password:
        raise EnvironmentError("POSTGRES_PASSWORD environment variable is required")
    
    return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

def create_app():

    current_dir = os.path.dirname(os.path.abspath(__file__))
    instance_path = os.path.join(current_dir, 'instance')

    app = Flask(__name__, instance_path=instance_path)
    CORS(app)

    # --- Cấu hình SQLAlchemy ---
    DATABASE_URI = get_database_uri()

    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
    # --- Kết thúc cấu hình SQLAlchemy ---

    # --- Cấu hình JWT ---
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key') # Lấy từ env hoặc dùng giá trị mặc định (KHÔNG AN TOÀN CHO PRODUCTION)
    # Cấu hình thời gian hết hạn token
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15) # Access token hết hạn sau 15 phút
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)    # Refresh token hết hạn sau 7 ngày
    # --- Kết thúc cấu hình JWT ---

    app.config.from_prefixed_env()

    #initialize exts
    db.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)

    #create all tables
    with app.app_context():
        db.create_all()

    #register blueprints
    app.register_blueprint(auth_bp, url_prefix = '/auth')
    app.register_blueprint(user_bp, url_prefix = '/users')
    app.register_blueprint(chat_bp, url_prefix = '/chat')
    app.register_blueprint(chat_history_bp, url_prefix='/chat_history')

    #load user
    @jwt.user_lookup_loader
    def user_loader_callback(_jwt_headers, jwt_data):
        identity = jwt_data['sub']
        if identity == 'guest_user':
            return type('Guest', (object,), {'username': 'guest'})()
        return User.query.filter_by(username = identity).one_or_none()

    #jwt error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({"Message" : "Token has expired!", "error" : "token_expired"}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"Message" : "Token is invalid!", "error" : "token_invalid"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"message" : "Request does not contain an access token", "error" : "authorization_required"}), 401
    
    @jwt.token_in_blocklist_loader
    def check_if_token_in_blocklist(jwt_header, jwt_data):
        jti = jwt_data['jti']

        #check if the token is in the blocklist
        token = TokenBlocklist.query.filter_by(jti=jti).scalar()

        return token is not None

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
