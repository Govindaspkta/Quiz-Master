from backend.models import db
from .user import User
from .quiz import Quiz
from .category import Category

class QuizHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=True)  # Allow null for dynamic quizzes
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)  # Added to track category
    score = db.Column(db.Integer, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    time_taken = db.Column(db.Integer)  # Duration in seconds
    attempt_number = db.Column(db.Integer, default=1, nullable=False)
    started_at = db.Column(db.DateTime, server_default=db.func.now())
    completed_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.Enum('in_progress', 'completed'), default='in_progress', nullable=False)
    user = db.relationship('User', backref=db.backref('quiz_histories', lazy=True))
    quiz = db.relationship('Quiz', backref=db.backref('histories', lazy=True))
    category = db.relationship('Category', backref=db.backref('quiz_histories', lazy=True))

    def __repr__(self):
        return f'<QuizHistory user_id={self.user_id} quiz_id={self.quiz_id} category_id={self.category_id}>'