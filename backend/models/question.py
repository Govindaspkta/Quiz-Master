from backend.models import db
from .quiz import Quiz
class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    question = db.Column(db.String(255), nullable=False)
    question_type = db.Column(db.Enum('multiple_choice', 'true_false', 'multiple_answer', 'short_answer'), default='multiple_choice', nullable=False)
    options = db.Column(db.JSON, nullable=True)  # Added for storing options as JSON
    answer = db.Column(db.String(255), nullable=True)  # Added for correct answer
    explanation = db.Column(db.Text, nullable=True)  # Added
    quiz = db.relationship('Quiz', backref=db.backref('questions', lazy=True))

    def __repr__(self):
        return f'<Question {self.question}>'