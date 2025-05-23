from extensions import db # Giả định db được khởi tạo trong extensions.py
import bcrypt
from datetime import datetime, timezone

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    birth_year = db.Column(db.Integer) # Thêm birth_year
    password_hash = db.Column(db.String(255), nullable=False) # Đổi tên thành password_hash
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now()) # Thêm created_at với timezone

    # Mối quan hệ với TokenBlocklist (một User có thể có nhiều token bị block)
    blocked_tokens = db.relationship('TokenBlocklist', backref='user', lazy=True, cascade="all, delete-orphan")
    # Mối quan hệ với ChatSession (nếu cần giữ lại)
    # chat_sessions = db.relationship('ChatSession', backref='user', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.username}>"

    def set_password(self, password):
        # Sử dụng bcrypt để hash password
        pw_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        self.password_hash = pw_hash.decode('utf-8')

    def check_password(self, password):
        # Kiểm tra password với hash đã lưu bằng bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    @classmethod
    def get_user_by_username(cls, username):
        return cls.query.filter_by(username=username).first()
        
    @classmethod
    def get_user_by_email(cls, email): # Thêm phương thức tìm theo email
        return cls.query.filter_by(email=email).first()

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

class TokenBlocklist(db.Model):
    __tablename__ = "token_blocklist" # Đảm bảo tên bảng đúng
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), unique=True, nullable=False, index=True) # Đảm bảo jti là unique
    token_type = db.Column(db.String(10), nullable=False) # Thêm token_type
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False) # Thêm user_id và ondelete
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now()) # Thêm timezone
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False, index=True) # Thêm expires_at với timezone VÀ INDEX
    
    def __repr__(self):
        return f"<Token {self.jti}>"
    
    def save(self):
        db.session.add(self)
        db.session.commit()

# # --- Giữ lại các model ChatSession và ChatMessage nếu chúng vẫn cần thiết ---
class ChatSession(db.Model):
    __tablename__ = 'chat_session' # Đảm bảo tên bảng đúng nếu có thay đổi
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False, default="New Chat")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    messages = db.relationship('ChatMessage', backref='session', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<ChatSession {self.id} - {self.title}>'

class ChatMessage(db.Model):
    __tablename__ = 'chat_message' # Đảm bảo tên bảng đúng nếu có thay đổi
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_session.id'), nullable=False)
    sender = db.Column(db.String(10), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<ChatMessage {self.id} from {self.sender}>'