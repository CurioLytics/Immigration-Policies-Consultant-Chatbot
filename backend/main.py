from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, jwt
from authentication import auth_bp
from users import user_bp
from models import User, TokenBlocklist

import os

def create_app():

    current_dir = os.path.dirname(os.path.abspath(__file__))
    instance_path = os.path.join(current_dir, 'instance')

    app = Flask(__name__, instance_path=instance_path)
    CORS(app)

    app.config.from_prefixed_env()

    #initialize exts
    db.init_app(app)
    jwt.init_app(app)

    #register blueprints
    app.register_blueprint(auth_bp, url_prefix = '/auth')
    app.register_blueprint(user_bp, url_prefix = '/users')

    #load user
    @jwt.user_lookup_loader
    def user_loader_callback(_jwt_headers, jwt_data):
        identity = jwt_data['sub']
        return User.query.filter_by(username = identity).one_or_none()

    #additional claims for admin
    @jwt.additional_claims_loader
    def add_claims_to_access_token(identity):
        if identity == "TuanVo123":
            return {
                'is_admin' : True
            }
        return {
            'is_admin' : False

        }

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
        token = db.session.query(TokenBlocklist).filter(TokenBlocklist.jti == jti).scalar()

        return token is not None


    return app


