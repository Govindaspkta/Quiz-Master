from backend.models import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('user', 'admin'), default='user', nullable=False)
    is_verified = db.Column(db.Boolean, default=False)  # Verification status for users
    def __repr__(self):
        return f'<User {self.username}>'