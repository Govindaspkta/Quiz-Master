from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from backend.models import db, Question, Admin, Quiz, QuizHistory, StandaloneQuestion
from sqlalchemy import func
from datetime import datetime
import time
import random
import traceback
import requests

quiz_bp = Blueprint('quiz', __name__)

# Custom random number generator using Linear Congruential Generator (LCG)
class CustomRandom:
    def __init__(self):
        # Initialize seed with current timestamp (in milliseconds)
        try:
            self.seed = int(time.time() * 1000) & 0xFFFFFFFF  # Keep within 32 bits
        except Exception as e:
            print(f"[{datetime.now()}] Error initializing CustomRandom seed: {str(e)}")
            raise
        # LCG parameters
        self.a = 1664525
        self.c = 1013904223
        self.m = 2**32  # 4294967296

    def next(self, min_val, max_val):
        """Generate a pseudo-random integer in range [min_val, max_val]."""
        try:
            self.seed = (self.a * self.seed + self.c) % self.m
            range_size = max_val - min_val + 1
            if range_size <= 0:
                print(f"[{datetime.now()}] Invalid range in CustomRandom.next: min_val={min_val}, max_val={max_val}")
                return min_val
            return min_val + (self.seed % range_size)
        except Exception as e:
            print(f"[{datetime.now()}] Error in CustomRandom.next: {str(e)}")
            raise

# Custom shuffle function using Fisher-Yates with custom random number generator
def custom_shuffle(items):
    """Custom Fisher-Yates Shuffle using a custom LCG random number generator."""
    try:
        n = len(items)
        if n <= 1:
            return items
        rng = CustomRandom()  # Initialize custom random number generator
        for i in range(n - 1, -1, -1):
            j = rng.next(0, i)  # Get random index from 0 to i
            items[i], items[j] = items[j], items[i]  # Swap elements
        return items
    except Exception as e:
        print(f"[{datetime.now()}] Error in custom_shuffle: {str(e)}")
        raise

@quiz_bp.route('/quizzes', methods=['GET'])
@jwt_required()
def get_quizzes():
    """Fetch quizzes filtered by category_id for authenticated users."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        print(f"[{datetime.now()}] Authenticated user ID: {user_id}, Role: {role}")
        if role not in ['admin', 'user']:
            return jsonify({'message': 'Unauthorized access'}), 403

        category_id = request.args.get('category_id')
        print(f"[{datetime.now()}] Requested category_id: {category_id}")
        query = Quiz.query.filter_by(is_active=True)
        if category_id:
            try:
                category_id = int(category_id)  # Convert to integer to match database
                query = query.filter_by(category_id=category_id)
                print(f"[{datetime.now()}] Filtering quizzes with category_id: {category_id}")
            except ValueError:
                print(f"[{datetime.now()}] Invalid category_id format: {category_id}")
                return jsonify({'message': 'Invalid category_id format'}), 400

        quizzes = query.all()
        print(f"[{datetime.now()}] Found {len(quizzes)} quizzes: {[q.id for q in quizzes]}")
        if not quizzes:
            print(f"[{datetime.now()}] No quizzes found for category_id: {category_id}")
            return jsonify({'message': 'No quizzes found for this category'}), 200

        return jsonify([{
            'id': str(quiz.id),
            'title': quiz.title or 'Unnamed Quiz',
            'category': {
                'id': str(category_id) if quiz.category_id else None,
                'name': quiz.category.name if quiz.category else 'Unknown',
                'icon': quiz.category.icon if quiz.category else '❓'
            } if quiz.category_id else {'id': None, 'name': 'Unknown', 'icon': '❓'},
            'difficulty': quiz.difficulty or 'Medium',
            'description': quiz.description or 'No description available',
            'timeLimit': quiz.time_limit or 15,
            'isPublic': quiz.is_active,
            'rating': 4.0,
            'totalRatings': 0
        } for quiz in quizzes]), 200
    except Exception as e:
        print(f"[{datetime.now()}] Error in get_quizzes: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': f'Internal server error: {str(e)}'}), 500

@quiz_bp.route('/quizzes/<int:quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz(quiz_id):
    """Fetch details of a specific quiz, including its questions, with mode support."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        print(f"[{datetime.now()}] Authenticated user ID: {user_id}, Role: {role}")
        if role not in ['admin', 'user']:
            return jsonify({'message': 'Unauthorized access'}), 403

        quiz = Quiz.query.get_or_404(quiz_id)
        if not quiz.is_active:
            return jsonify({'message': 'Quiz is not active'}), 403

        mode = request.args.get('mode', 'standard')
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        print(f"[{datetime.now()}] Found {len(questions)} questions for quiz_id {quiz_id}: {[q.id for q in questions]}")

        if not questions:
            print(f"[{datetime.now()}] No questions found for quiz_id {quiz_id}, checking database state...")
            count = db.session.query(Question).filter_by(quiz_id=quiz_id).count()
            if count == 0:
                print(f"[{datetime.now()}] No records in Question table for quiz_id {quiz_id}")
                questions = [
                    Question(
                        id=22,
                        quiz_id=quiz_id,
                        question="What is the capital of Nepal?",
                        question_type="multiple_choice",
                        options=["Kathmandu", "Pokhara", "Biratnagar", "Lalitpur"],
                        answer="Kathmandu",
                        explanation="Kathmandu is the capital of Nepal."
                    ),
                    Question(
                        id=23,
                        quiz_id=quiz_id,
                        question="What is 2 + 2?",
                        question_type="multiple_choice",
                        options=["3", "4", "5", "6"],
                        answer="4",
                        explanation="2 + 2 equals 4."
                    )
                ]
                print(f"[{datetime.now()}] Using hardcoded questions as fallback: {[q.id for q in questions]}")
            else:
                print(f"[{datetime.now()}] Query returned 0 results but {count} records exist, potential mapping issue")
                return jsonify({'message': 'Error fetching questions'}), 500

        mapped_questions = []
        for q in questions:
            try:
                options = q.options if q.options and isinstance(q.options, (list, tuple)) else []
                mapped_questions.append({
                    'id': str(q.id),
                    'question': q.question if q.question and q.question.strip() else f"Question {q.id} (Text Missing)",
                    'type': q.question_type if q.question_type else 'multiple_choice',
                    'options': [
                        {'id': idx + 1, 'option_text': opt, 'is_correct': opt == q.answer}
                        for idx, opt in enumerate(options)
                    ],
                    'answer': q.answer if q.answer else '',
                    'explanation': q.explanation if q.explanation else 'No explanation provided.'
                })
            except Exception as e:
                print(f"[{datetime.now()}] Error processing question ID {q.id}: {str(e)}")
                continue

        if not mapped_questions:
            print(f"[{datetime.now()}] No valid questions could be processed for quiz_id {quiz_id}")
            return jsonify({'message': 'No valid questions available'}), 200

        custom_shuffle(mapped_questions)  # Custom shuffle for question order
        for q in mapped_questions:
            if q['options']:
                custom_shuffle(q['options'])  # Custom shuffle for option order
            else:
                print(f"[{datetime.now()}] Question {q['id']} has no options: {q['question']}")

        time_limit = quiz.time_limit if quiz.time_limit is not None else 15
        if mode == 'rapidfire':
            time_limit = 10
        elif mode == 'timefree':
            time_limit = 0
        elif mode in ['hardmode', 'multiplayer']:
            time_limit = 15

        response = {
            'id': str(quiz.id),
            'title': quiz.title,
            'category': {
                'id': str(quiz.category_id),
                'name': quiz.category.name if quiz.category else 'Unknown',
                'icon': quiz.category.icon if quiz.category else '❓'
            },
            'difficulty': quiz.difficulty,
            'description': quiz.description,
            'timeLimit': time_limit,
            'isPublic': quiz.is_active,
            'questions': mapped_questions,
            'mode': mode
        }
        print(f"[{datetime.now()}] Returning quiz response: {response['id']}, questions: {len(mapped_questions)}")
        return jsonify(response), 200
    except Exception as e:
        print(f"[{datetime.now()}] Error in get_quiz: {str(e)}")
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
        print(f"[{datetime.now()}] JWT Identity: {user_id}, Role: {role}")

        if role != 'admin':
            return jsonify({'message': 'Only admins can create quizzes'}), 403

        admin = Admin.query.get(int(user_id))
        if not admin:
            print(f"[{datetime.now()}] Admin not found for ID: {user_id}")
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
        print(f"[{datetime.now()}] Quiz created with ID: {new_quiz.id}")
        return jsonify({'message': 'Quiz created successfully', 'id': str(new_quiz.id)}), 201
    except Exception as e:
        db.session.rollback()
        print(f"[{datetime.now()}] Error creating quiz: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': f'Internal server error: {str(e)}'}), 500

@quiz_bp.route('/quizzes/dynamic', methods=['GET'])
@jwt_required()
def get_dynamic_quiz():
    """Fetch a dynamic quiz with a specified number of questions from StandaloneQuestion."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        print(f"[{datetime.now()}] Authenticated user ID: {user_id}, Role: {role}")

        if role not in ['admin', 'user']:
            return jsonify({'message': 'Unauthorized access'}), 403

        mode = request.args.get('mode', 'standard')
        num_questions = request.args.get('num_questions', type=int, default=15)
        category_id = request.args.get('category_id')

        if num_questions < 1:
            print(f"[{datetime.now()}] Invalid num_questions: {num_questions}")
            return jsonify({'message': 'Number of questions must be at least 1'}), 400

        query = StandaloneQuestion.query
        if category_id:
            print(f"[{datetime.now()}] Category filtering requested (category_id: {category_id}), but StandaloneQuestion lacks category_id field.")

        questions = query.all()
        print(f"[{datetime.now()}] Total questions found in StandaloneQuestion: {len(questions)}")
        if not questions or len(questions) < num_questions:
            print(f"[{datetime.now()}] Insufficient questions: found {len(questions)} but needed {num_questions}")
            return jsonify({'message': 'Insufficient questions available'}), 200

        selected_questions = random.sample(questions, min(num_questions, len(questions)))

        question_list = []
        for q in selected_questions:
            try:
                options = q.options if q.options and isinstance(q.options, (list, tuple)) else []
                question_list.append({
                    'id': str(q.id),
                    'question': q.question if q.question and q.question.strip() else f"Question {q.id} (Text Missing)",
                    'type': q.question_type if q.question_type else 'multiple_choice',
                    'options': [
                        {'id': idx + 1, 'option_text': opt, 'is_correct': opt == q.answer}
                        for idx, opt in enumerate(options)
                    ],
                    'answer': q.answer if q.answer else '',
                    'explanation': q.explanation if q.explanation else 'No explanation provided.'
                })
            except Exception as e:
                print(f"[{datetime.now()}] Error processing question ID {q.id}: {str(e)}")
                continue

        if not question_list:
            print(f"[{datetime.now()}] No valid questions could be processed")
            return jsonify({'message': 'No valid questions available'}), 200

        custom_shuffle(question_list)  # Custom shuffle for question order
        for q in question_list:
            if q['options']:
                custom_shuffle(q['options'])  # Custom shuffle for option order
            else:
                print(f"[{datetime.now()}] Question {q['id']} has no options: {q['question']}")

        time_limit = 15
        if mode == 'rapidfire':
            time_limit = 10
        elif mode == 'timefree':
            time_limit = 0
        elif mode in ['hardmode', 'multiplayer']:
            time_limit = 15

        print(f"[{datetime.now()}] Returning dynamic quiz with {len(question_list)} questions")
        return jsonify({
            'id': 'dynamic',
            'title': f'Dynamic {mode.capitalize()} Quiz',
            'category': {'id': category_id or 'all', 'name': 'All Categories', 'icon': '🎲'},
            'difficulty': 'medium',
            'description': f'A randomly generated quiz with {len(question_list)} questions',
            'timeLimit': time_limit,
            'isPublic': True,
            'questions': question_list,
            'mode': mode,
        }), 200
    except Exception as e:
        print(f"[{datetime.now()}] Error in get_dynamic_quiz: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': 'Internal server error'}), 500

@quiz_bp.route('/quizzes/submit', methods=['POST'])
@jwt_required()
def submit_quiz():
    """Submit quiz answers and save to quiz_history, handling both Question and StandaloneQuestion."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        print(f"[{datetime.now()}] Authenticated user ID: {user_id}, Role: {role}")

        if role not in ['admin', 'user']:
            return jsonify({'message': 'Unauthorized access'}), 403

        data = request.get_json()
        print(f"[{datetime.now()}] Received submit payload: {data}")
        quiz_id = data.get('quiz_id')
        category_id = data.get('category_id')
        answers = data.get('answers', [])
        time_taken = data.get('time_taken')
        started_at = data.get('started_at')
        completed_at = data.get('completed_at')
        total_questions = data.get('total_questions')
        mode = data.get('mode', 'standard')

        if not all([answers, time_taken is not None, started_at, completed_at, total_questions]):
            print(f"[{datetime.now()}] Missing required fields in payload: {data}")
            return jsonify({'message': 'Missing required fields'}), 400

        is_dynamic = quiz_id == 'dynamic'
        if not is_dynamic:
            try:
                quiz_id = int(quiz_id)
                quiz = Quiz.query.get_or_404(quiz_id)
                if not quiz.is_active:
                    print(f"[{datetime.now()}] Quiz {quiz_id} is not active")
                    return jsonify({'message': 'Quiz is not active'}), 403
            except (ValueError, TypeError):
                print(f"[{datetime.now()}] Invalid quiz_id format: {quiz_id}")
                return jsonify({'message': 'Invalid quiz_id format'}), 400
        else:
            quiz_id = None

        correct_count = 0
        processed_questions = 0
        for answer in answers:
            question_id = answer.get('question_id')
            user_option_id = answer.get('option_id')

            if not question_id:
                print(f"[{datetime.now()}] Skipping answer due to missing question_id")
                continue

            try:
                question_id = int(question_id)
            except (ValueError, TypeError) as e:
                print(f"[{datetime.now()}] Invalid question_id format: {question_id}, error: {e}")
                continue

            question = StandaloneQuestion.query.get(question_id) if is_dynamic else Question.query.get(question_id)
            if not question:
                print(f"[{datetime.now()}] Question not found: {question_id}")
                continue

            if not question.options or not isinstance(question.options, (list, tuple)):
                print(f"[{datetime.now()}] Invalid or empty options for question {question_id}")
                continue

            processed_questions += 1
            correct_option = next((opt for idx, opt in enumerate(question.options) if opt == question.answer), None)
            if user_option_id is not None and 1 <= user_option_id <= len(question.options):
                user_selected_option = question.options[user_option_id - 1]
                if correct_option and user_selected_option == correct_option:
                    correct_count += 1
            else:
                print(f"[{datetime.now()}] Invalid or missing option_id {user_option_id} for question {question_id}, options length: {len(question.options)}")

        total_questions = max(processed_questions, total_questions) if processed_questions > 0 else total_questions
        score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0

        try:
            started_at_dt = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
            completed_at_dt = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
        except ValueError as ve:
            print(f"[{datetime.now()}] Invalid datetime format: {ve}")
            return jsonify({'message': 'Invalid date format'}), 400

        query = db.session.query(func.count(QuizHistory.id)).filter_by(user_id=user_id, quiz_id=quiz_id)
        if category_id and hasattr(QuizHistory, 'category_id'):
            try:
                category_id = int(category_id) if category_id else None
                query = query.filter_by(category_id=category_id)
            except (ValueError, TypeError):
                print(f"[{datetime.now()}] Invalid category_id format: {category_id}")
                category_id = None
        else:
            category_id = None
        attempt_number = query.scalar() + 1

        history_entry = QuizHistory(
            user_id=user_id,
            quiz_id=quiz_id,
            category_id=category_id,
            score=score,
            total_questions=total_questions,
            time_taken=time_taken,
            attempt_number=attempt_number,
            started_at=started_at_dt,
            completed_at=completed_at_dt,
            status='completed'
        )
        db.session.add(history_entry)
        db.session.commit()

        print(f"[{datetime.now()}] Quiz attempt saved for user {user_id}, quiz_id: {quiz_id or 'dynamic'}, category_id: {category_id}, score: {score}, correct: {correct_count}/{total_questions}")
        return jsonify({
            'message': 'Quiz submitted successfully',
            'score': score,
            'correct_answers': correct_count,
            'total_questions': total_questions
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"[{datetime.now()}] Error in submit_quiz: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': f'Internal server error: {str(e)}'}), 500

@quiz_bp.route('/history', methods=['GET'])
@jwt_required()
def get_quiz_history():
    """Fetch quiz history for the authenticated user."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        print(f"[{datetime.now()}] Authenticated user ID: {user_id}, Role: {role}")

        if role not in ['admin', 'user']:
            return jsonify({'message': 'Unauthorized access'}), 403

        history_entries = QuizHistory.query.filter_by(user_id=user_id).order_by(QuizHistory.completed_at.desc()).all()
        print(f"[{datetime.now()}] Found {len(history_entries)} history entries for user {user_id}")

        if not history_entries:
            return jsonify({'message': 'No quiz history found'}), 200

        history_data = [
            {
                'id': entry.id,
                'quizId': str(entry.quiz_id) if entry.quiz_id else 'dynamic',
                'title': entry.quiz.title if entry.quiz else 'Dynamic Quiz',
                'category': entry.category.name if entry.category else 'All Categories',
                'color': '#7209b7' if entry.category else '#666666',
                'date': entry.completed_at.isoformat() if entry.completed_at else entry.started_at.isoformat(),
                'score': entry.score,
                'totalQuestions': entry.total_questions,
                'timeTaken': entry.time_taken // 60 if entry.time_taken else 0,
                'completed': entry.status == 'completed'
            } for entry in history_entries
        ]
        print(f"[{datetime.now()}] Returning history data: {[entry['id'] for entry in history_data]}")
        return jsonify(history_data), 200
    except Exception as e:
        print(f"[{datetime.now()}] Error in get_quiz_history: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'message': 'Internal server error'}), 500
    


# New route for updating a standalone question

@quiz_bp.route('/standalone-questions', methods=['GET'])
@jwt_required()
def get_standalone_questions():
    """Get all standalone questions for admin management."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        
        if role != 'admin':
            return jsonify({'message': 'Only admins can access standalone questions'}), 403
        
        questions = StandaloneQuestion.query.all()
        questions_data = []
        
        for q in questions:
            # Ensure options are properly formatted
            options = q.options if q.options and isinstance(q.options, (dict, list)) else []
            
            # Convert options to consistent format
            if isinstance(options, dict):
                # If options are stored as dict like {"A": "option1", "B": "option2"}
                options_list = [options.get(key, '') for key in ['A', 'B', 'C', 'D']]
            elif isinstance(options, list):
                # If options are stored as list
                options_list = options
            else:
                options_list = []
            
            questions_data.append({
                'id': q.id,
                'question': q.question,
                'question_type': q.question_type,
                'options': options_list,
                'answer': q.answer,
                'explanation': q.explanation or ''
            })
        
        print(f"[{datetime.now()}] Found {len(questions_data)} standalone questions")
        return jsonify(questions_data), 200
        
    except Exception as e:
        print(f"[{datetime.now()}] Error in get_standalone_questions: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@quiz_bp.route('/standalone-questions/<int:question_id>', methods=['GET'])
@jwt_required()
def get_standalone_question(question_id):
    """Get a specific standalone question by ID."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        
        if role != 'admin':
            return jsonify({'message': 'Only admins can access standalone questions'}), 403
        
        question = StandaloneQuestion.query.get_or_404(question_id)
        
        # Ensure options are properly formatted
        options = question.options if question.options and isinstance(question.options, (dict, list)) else []
        
        # Convert options to consistent format
        if isinstance(options, dict):
            options_formatted = options
        elif isinstance(options, list):
            # Convert list to dict format for frontend
            options_formatted = {
                'A': options[0] if len(options) > 0 else '',
                'B': options[1] if len(options) > 1 else '',
                'C': options[2] if len(options) > 2 else '',
                'D': options[3] if len(options) > 3 else ''
            }
        else:
            options_formatted = {'A': '', 'B': '', 'C': '', 'D': ''}
        
        question_data = {
            'id': question.id,
            'question': question.question,
            'question_type': question.question_type,
            'options': options_formatted,
            'answer': question.answer,
            'explanation': question.explanation or ''
        }
        
        print(f"[{datetime.now()}] Retrieved standalone question {question_id}")
        return jsonify(question_data), 200
        
    except Exception as e:
        print(f"[{datetime.now()}] Error in get_standalone_question: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@quiz_bp.route('/standalone-questions/<int:question_id>', methods=['PUT'])
@jwt_required()
def update_standalone_question(question_id):
    """Update a standalone question."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        
        if role != 'admin':
            return jsonify({'message': 'Only admins can update standalone questions'}), 403
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        question = StandaloneQuestion.query.get_or_404(question_id)
        
        # Update basic fields
        question.question = data.get('question', question.question).strip()
        question.question_type = data.get('question_type', question.question_type)
        question.answer = data.get('answer', question.answer).strip()
        question.explanation = data.get('explanation', question.explanation or '').strip()
        
        # Handle options update
        options_data = data.get('options', {})
        
        if question.question_type == 'multiple_choice':
            if isinstance(options_data, dict):
                # Store as list format for consistency
                options_list = [
                    options_data.get('A', '').strip(),
                    options_data.get('B', '').strip(),
                    options_data.get('C', '').strip(),
                    options_data.get('D', '').strip()
                ]
                # Filter out empty options
                options_list = [opt for opt in options_list if opt]
                question.options = options_list
            elif isinstance(options_data, list):
                # Filter out empty options
                question.options = [opt.strip() for opt in options_data if opt.strip()]
        elif question.question_type == 'true_false':
            question.options = ['True', 'False']
        else:
            question.options = []

        # Validate that answer exists in options for multiple choice
        if question.question_type == 'multiple_choice' and question.options:
            if question.answer not in question.options:
                return jsonify({"error": "Answer must be one of the provided options"}), 400
        elif question.question_type == 'true_false':
            if question.answer not in ['True', 'False']:
                return jsonify({"error": "Answer must be 'True' or 'False' for true/false questions"}), 400

        db.session.commit()
        print(f"[{datetime.now()}] Updated standalone question {question_id}")
        
        return jsonify({
            "message": "Question updated successfully", 
            "id": question.id,
            "question": question.question,
            "question_type": question.question_type,
            "options": question.options,
            "answer": question.answer,
            "explanation": question.explanation
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"[{datetime.now()}] Error in update_standalone_question: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@quiz_bp.route('/standalone-questions/<int:question_id>', methods=['DELETE'])
@jwt_required()
def delete_standalone_question(question_id):
    """Delete a standalone question."""
    try:
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')
        
        if role != 'admin':
            return jsonify({'message': 'Only admins can delete standalone questions'}), 403
        
        question = StandaloneQuestion.query.get_or_404(question_id)
        
        # Store question title for response
        question_text = question.question
        
        db.session.delete(question)
        db.session.commit()
        
        print(f"[{datetime.now()}] Deleted standalone question {question_id}: {question_text}")
        return jsonify({
            "message": "Question deleted successfully", 
            "id": question_id,
            "deleted_question": question_text
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"[{datetime.now()}] Error in delete_standalone_question: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500