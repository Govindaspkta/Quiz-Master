from backend.models import db
from .category import Category
from .admin import Admin

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    difficulty = db.Column(db.Enum('easy', 'medium', 'hard'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.now())
    is_active = db.Column(db.Boolean, default=True, nullable=False)  # Maps to isPublic
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)
    description = db.Column(db.Text, nullable=True)  # Added
    time_limit = db.Column(db.Integer, nullable=True)  # Added (in minutes)
    category = db.relationship('Category', backref=db.backref('quizzes', lazy=True))
    admin = db.relationship('Admin', backref=db.backref('quizzes_created', lazy=True))

    def __repr__(self):
        return f'<Quiz {self.title}>'