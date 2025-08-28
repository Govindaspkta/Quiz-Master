from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, QuizHistory, Quiz
from datetime import datetime

history_bp = Blueprint('history', __name__)

@history_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    """Fetch the quiz history for the authenticated user."""
    user_id = get_jwt_identity()
    history = QuizHistory.query.filter_by(user_id=user_id).order_by(QuizHistory.completed_at.desc()).all()
    print(f"[{datetime.now()}] Found {len(history)} history entries for user {user_id}")
    return jsonify([{
        'id': h.id,
        'quiz_id': h.quiz_id,
        'score': h.score,
        'total_questions': h.total_questions,
        'time_taken': h.time_taken,
        'attempt_number': h.attempt_number,
        'started_at': h.started_at.isoformat(),
        'completed_at': h.completed_at.isoformat(),
        'status': h.status,
        'category_id': h.category_id
    } for h in history]), 200

@history_bp.route('/history', methods=['POST'])
@jwt_required()
def add_history():
    """Add a quiz result to the user's history."""
    user_id = get_jwt_identity()
    data = request.get_json()
    quiz_id = data.get('quiz_id')  # Make optional for dynamic quizzes
    score = data.get('score')
    total_questions = data.get('total_questions')
    time_taken = data.get('time_taken')
    attempt_number = data.get('attempt_number', 1)
    started_at = data.get('started_at')
    completed_at = data.get('completed_at')
    status = data.get('status', 'completed')
    category_id = data.get('category_id')

    if not all([score is not None, total_questions is not None, time_taken is not None]):
        print(f"[{datetime.now()}] Missing required fields in payload: {data}")
        return jsonify({'message': 'Missing required fields'}), 400

    # No need to verify quiz_id if it's None (e.g., for dynamic quizzes)
    if quiz_id:
        quiz = Quiz.query.get(quiz_id)  # Use get() instead of get_or_404() to allow None
        if quiz and not quiz.is_active:
            print(f"[{datetime.now()}] Quiz {quiz_id} is not active")
            return jsonify({'message': 'Quiz is not active'}), 403

    try:
        started_at_dt = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
        completed_at_dt = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
    except ValueError as ve:
        print(f"[{datetime.now()}] Invalid datetime format: {ve}")
        return jsonify({'message': 'Invalid date format'}), 400

    # Calculate attempt number based on existing history
    attempt_number = (db.session.query(func.count(QuizHistory.id)).filter_by(
        user_id=user_id, quiz_id=quiz_id, category_id=category_id
    ).scalar() or 0) + 1

    new_history = QuizHistory(
        user_id=user_id,
        quiz_id=quiz_id,  # Can be None for dynamic quizzes
        category_id=category_id,
        score=score,
        total_questions=total_questions,
        time_taken=time_taken,
        attempt_number=attempt_number,
        started_at=started_at_dt,
        completed_at=completed_at_dt,
        status=status,
        mode=data.get('mode', 'standard')  # Add mode for consistency
    )
    db.session.add(new_history)
    db.session.commit()

    print(f"[{datetime.now()}] Quiz history added for user {user_id}, quiz_id: {quiz_id}, score: {score}")
    return jsonify({'message': 'Quiz history added successfully'}), 201
