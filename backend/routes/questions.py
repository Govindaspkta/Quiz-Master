# routes/questions.py
from flask import Blueprint, request, jsonify
from backend.models import db, StandaloneQuestion

question_bp = Blueprint('questions', __name__)

@question_bp.route('/questions', methods=['POST', 'OPTIONS'])
def add_question():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:8100')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response, 200

    try:
        data = request.get_json()
        print(f"Received data: {data}")  # Debug log
        required_fields = ['question', 'question_type', 'options', 'answer']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing or empty {field}'}), 400

        new_question = StandaloneQuestion(
            question=data['question'],
            question_type=data['question_type'],
            options=data['options'],
            answer=data['answer'],
            explanation=data.get('explanation', '')
        )
        db.session.add(new_question)
        db.session.commit()

        return jsonify({'message': 'Question added successfully', 'id': new_question.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding question: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 500