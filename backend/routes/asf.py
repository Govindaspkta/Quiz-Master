from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from backend.models import db, Quiz, Question, Admin
from sqlalchemy import func
from datetime import datetime
import random
import traceback

quiz_bp = Blueprint('quiz', __name__)

# Define QuizHistory model
class QuizHistory(db.Model):
    __tablename__ = 'quiz_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=True)
    score = db.Column(db.Float, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    time_taken = db.Column(db.Integer, nullable=False)
    attempt_number = db.Column(db.Integer, nullable=False)
    started_at = db.Column(db.DateTime, nullable=False)
    completed_at = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    mode = db.Column(db.String(50), nullable=True)

@quiz_bp.route('/quizzes', methods=['GET'])
@jwt_required()
def get_quizzes():
    """Fetch quizzes filtered by category_id for the authenticated user."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        print(f"Authenticated user ID: {user_id}, Role: {role}")

        if role != 'admin' and role != 'user':
            return jsonify({'message': 'Unauthorized access'}), 403

        category_id = request.args.get('category_id')
        print(f"Requested category_id: {category_id}")
        query = Quiz.query.filter_by(is_active=True)
        if category_id:
            query = query.filter_by(category_id=category_id)
            print(f"Filtering quizzes with category_id: {category_id}")

        quizzes = query.all()
        if not quizzes:
            print("No quizzes found for the given category_id")
            return jsonify({'message': 'No quizzes found for this category'}), 200

        print(f"Found quizzes: {[q.category_id for q in quizzes]}")
        return jsonify([{
            'id': quiz.id,
            'title': quiz.title,
            'category': {
                'id': str(quiz.category_id),
                'name': quiz.category.name if quiz.category else 'Unknown',
                'icon': quiz.category.icon if quiz.category else '❓'
            },
            'difficulty': quiz.difficulty,
            'description': quiz.description,
            'timeLimit': quiz.time_limit,
            'isPublic': quiz.is_active
        } for quiz in quizzes]), 200
    except Exception as e:
        print(f"Error in get_quizzes: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': 'Internal server error'}), 500

@quiz_bp.route('/quizzes/<int:quiz_id>', methods=['GET'])  # Line 233
@jwt_required()
def get_quiz(quiz_id):
    """Fetch details of a specific quiz, including its questions."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        print(f"Authenticated user ID: {user_id}, Role: {role}")

        if role != 'admin' and role != 'user':
            return jsonify({'message': 'Unauthorized access'}), 403

        quiz = Quiz.query.get_or_404(quiz_id)
        if not quiz.is_active:
            return jsonify({'message': 'Quiz is not active'}), 403

        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        return jsonify({  # Line 250
            'id': quiz.id,
            'title': quiz.title,
            'category': {
                'id': str(quiz.category_id),
                'name': quiz.category.name if quiz.category else 'Unknown',
                'icon': quiz.category.icon if quiz.category else '❓'
            },
            'difficulty': quiz.difficulty,
            'description': quiz.description,
            'timeLimit': quiz.time_limit,
            'isPublic': quiz.is_active,
            'questions': [{
                'id': q.id,
                'question': q.question,
                'type': q.question_type,
                'options': [
                    {'id': idx + 1, 'option_text': opt, 'is_correct': opt == q.answer}
                    for idx, opt in enumerate(q.options or [])
                ],
                'answer': q.answer,
                'explanation': q.explanation
            } for q in questions]
        }), 200
    except Exception as e:
        print(f"Error in get_quiz: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': 'Internal server error'}), 500

@quiz_bp.route('/quizzes', methods=['POST'])
@jwt_required()
def create_quiz():
    """Create a new quiz (for admin users)."""
    try:
        data = request.get_json()
        title = data.get('title')
        category_id = data.get('category')
        difficulty = data.get('difficulty')
        description = data.get('description')
        time_limit = data.get('timeLimit')
        is_public = data.get('isPublic', True)
        questions_data = data.get('questions', [])

        if not all([title, category_id, difficulty]):
            return jsonify({'message': 'Missing required fields: title, category, difficulty'}), 400

        if difficulty not in ['easy', 'medium', 'hard']:
            return jsonify({'message': 'Invalid difficulty level'}), 400

        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        print(f"JWT Identity: {user_id}, Role: {role}")

        if role != 'admin':
            return jsonify({'message': 'Only admins can create quizzes'}), 403

        admin = Admin.query.get(int(user_id))
        if not admin:
            print(f"Admin not found for ID: {user_id}")
            return jsonify({'message': 'Invalid admin user'}), 401

        new_quiz = Quiz(
            title=title,
            category_id=category_id,
            difficulty=difficulty,
            description=description,
            time_limit=time_limit,
            is_active=is_public,
            admin_id=int(user_id)
        )
        db.session.add(new_quiz)
        db.session.flush()

        for q_data in questions_data:
            question_type_map = {
                'multipleChoice': 'multiple_choice',
                'trueFalse': 'true_false',
                'multipleAnswer': 'multiple_answer',
                'shortAnswer': 'short_answer'
            }
            question_type = question_type_map.get(q_data.get('type'), 'multiple_choice')
            question = Question(
                quiz_id=new_quiz.id,
                question=q_data.get('question', ''),
                question_type=question_type,
                options=q_data.get('options', []),
                answer=q_data.get('correctAnswer', ''),
                explanation=q_data.get('explanation', '')
            )
            db.session.add(question)

        db.session.commit()
        print(f"Quiz created with ID: {new_quiz.id}")
        return jsonify({'message': 'Quiz created successfully', 'id': new_quiz.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating quiz: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': f'Internal server error: {str(e)}'}), 500

@quiz_bp.route('/quizzes/dynamic', methods=['GET'])
@jwt_required()
def get_dynamic_quiz():
    """Fetch a dynamic quiz with a specified number of questions."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        print(f"Authenticated user ID: {user_id}, Role: {role}")

        if role != 'admin' and role != 'user':
            return jsonify({'message': 'Unauthorized access'}), 403

        mode = request.args.get('mode', 'standard')
        num_questions = request.args.get('num_questions', type=int, default=15)
        category_id = request.args.get('category_id')

        # Base query for active quizzes
        query = Question.query.join(Quiz).filter(Quiz.is_active == True)
        if category_id:
            query = query.filter(Quiz.category_id == category_id)
            print(f"Filtering questions with category_id: {category_id}")

        questions = query.all()
        print(f"Total questions found: {len(questions)}")
        if not questions or len(questions) < num_questions:
            print(f"Insufficient questions: found {len(questions)} but needed {num_questions}")
            return jsonify({'message': 'Insufficient questions available'}), 200

        # Select and shuffle questions
        selected_questions = random.sample(questions, min(num_questions, len(questions)))

        question_list = [
            {
                'id': q.id,
                'question': q.question,
                'type': q.question_type,
                'options': [
                    {'id': idx + 1, 'option_text': opt, 'is_correct': opt == q.answer}
                    for idx, opt in enumerate(q.options or [])
                ],
                'answer': q.answer,
                'explanation': q.explanation
            } for q in selected_questions
        ]
        random.shuffle(question_list)  # Shuffle questions at backend
        for q in question_list:
            if q['options']:
                random.shuffle(q['options'])  # Shuffle options within questions
            else:
                print(f"Question {q['id']} has no options: {q['question']}")

        time_limit = 15  # Default 15 minutes
        if mode == 'rapidfire':
            time_limit = 10
        elif mode == 'timefree':
            time_limit = 0
        elif mode == 'hardmode' or mode == 'multiplayer':
            time_limit = 15

        print(f"Returning dynamic quiz with {len(question_list)} questions")
        return jsonify({
            'id': 'dynamic',
            'title': f'Dynamic {mode.capitalize()} Quiz',
            'category': {'id': 'all', 'name': 'All Categories', 'icon': '🎲'},
            'difficulty': 'medium',
            'description': f'A randomly generated quiz with {min(num_questions, len(questions))} questions',
            'timeLimit': time_limit,
            'isPublic': True,
            'questions': question_list,
            'mode': mode,
        }), 200
    except Exception as e:
        print(f"Error in get_dynamic_quiz: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': 'Internal server error'}), 500

@quiz_bp.route('/quizzes/<id>/submit', methods=['POST'])
@jwt_required()
def submit_quiz(id):
    """Submit quiz answers and save to quiz_history."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        print(f"Authenticated user ID: {user_id}, Role: {role}")

        if role != 'admin' and role != 'user':
            return jsonify({'message': 'Unauthorized access'}), 403

        data = request.get_json()
        answers = data.get('answers')
        time_taken = data.get('time_taken')
        started_at = data.get('started_at')
        completed_at = data.get('completed_at')
        total_questions = data.get('total_questions')
        mode = data.get('mode', 'standard')  # Default to 'standard' for category quizzes

        if not all([answers, time_taken is not None, started_at, completed_at, total_questions]):
            return jsonify({'message': 'Missing required fields'}), 400

        # Validate quiz_id (special handling for dynamic quizzes)
        quiz_id = None if id == 'dynamic' else int(id)
        if quiz_id:
            quiz = Quiz.query.get_or_404(quiz_id)
            if not quiz.is_active:
                return jsonify({'message': 'Quiz is not active'}), 403

        # Calculate score
        correct_count = 0
        for answer in answers:
            question = Question.query.get(answer['question_id'])
            if not question:
                continue
            correct_option = next((opt for idx, opt in enumerate(question.options) if opt == question.answer), None)
            user_option_id = answer['option_id']
            if user_option_id is not None and question.options[user_option_id - 1] == correct_option:
                correct_count += 1

        score = (correct_count / total_questions) * 100 if total_questions > 0 else 0

        # Calculate attempt_number
        attempt_number = db.session.query(func.count(QuizHistory.id)).filter_by(user_id=user_id, quiz_id=quiz_id).scalar() + 1

        # Create QuizHistory entry
        history_entry = QuizHistory(
            user_id=user_id,
            quiz_id=quiz_id,  # Will be NULL for dynamic quizzes
            score=score,
            total_questions=total_questions,
            time_taken=time_taken,
            attempt_number=attempt_number,
            started_at=datetime.fromisoformat(started_at.replace('Z', '+00:00')),
            completed_at=datetime.fromisoformat(completed_at.replace('Z', '+00:00')),
            status='completed',
            mode=mode
        )
        db.session.add(history_entry)
        db.session.commit()

        print(f"Quiz attempt saved for user {user_id}, quiz {id}, score: {score}")
        return jsonify({
            'message': 'Quiz submitted successfully',
            'score': score,
            'correct_answers': correct_count,
            'total_questions': total_questions
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error in submit_quiz: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': 'Internal server error'}), 500