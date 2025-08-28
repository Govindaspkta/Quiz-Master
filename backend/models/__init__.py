from flask_sqlalchemy import SQLAlchemy

# Define db first
db = SQLAlchemy()

# Import models after db is defined to avoid circular imports
from .category import Category
from .quiz import Quiz
from .question import Question
from .quiz_history import QuizHistory
from .user import User
from .admin import Admin
from .question_option import QuestionOption
from .user_answer import UserAnswer
from .standalone_ques import StandaloneQuestion