from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import JWTManager

# Khởi tạo đối tượng SQLAlchemy
db = SQLAlchemy()

# Khởi tạo đối tượng Limiter
# Sử dụng get_remote_address để xác định key cho rate limit (thường là IP)
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"] # Giới hạn mặc định, có thể tùy chỉnh
)

# Khởi tạo đối tượng JWTManager
jwt = JWTManager()


