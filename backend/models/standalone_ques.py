# backend/models.py
from flask_sqlalchemy import SQLAlchemy
from backend.models import db


class StandaloneQuestion(db.Model):
    __tablename__ = 'standalone_questions'
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(500), nullable=False)
    question_type = db.Column(db.String(50), nullable=False)
    options = db.Column(db.JSON, nullable=True)  # For multiple choice, true/false, etc.
    answer = db.Column(db.String(200), nullable=False)
    explanation = db.Column(db.String(1000), nullable=True)

    def __repr__(self):
        return f'<StandaloneQuestion {self.question}>'