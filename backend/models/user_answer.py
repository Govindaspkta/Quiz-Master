from backend.models import db
from .user import User
from .question import Question
from .question_option import QuestionOption

class UserAnswer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    option_id = db.Column(db.Integer, db.ForeignKey('question_option.id'), nullable=False)
    is_correct = db.Column(db.Boolean, default=False, nullable=False)
    answered_at = db.Column(db.DateTime, server_default=db.func.now())
    user = db.relationship('User', backref=db.backref('answers', lazy=True))
    question = db.relationship('Question', backref=db.backref('user_answers', lazy=True))
    option = db.relationship('QuestionOption', backref=db.backref('user_answers', lazy=True))

    def __repr__(self):
        return f'<UserAnswer user_id={self.user_id} question_id={self.question_id}>'