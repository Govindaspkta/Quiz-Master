from backend.models import db

class QuestionOption(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    text = db.Column(db.String(255), nullable=False)
    is_correct = db.Column(db.Boolean, default=False, nullable=False)
    question = db.relationship('Question', backref=db.backref('question_options', lazy=True))  # Changed backref name

    def __repr__(self):
        return f'<QuestionOption {self.text}>'