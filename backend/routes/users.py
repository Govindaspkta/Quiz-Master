from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import db, User,QuizHistory
import json
from sqlalchemy.exc import SQLAlchemyError


user_bp = Blueprint('users', __name__)

# Helper function to check if user is admin
def check_admin():
    try:
        identity_str = get_jwt_identity()
        print(f"Raw identity from JWT: {identity_str}, type: {type(identity_str)}")  # Debug log
        identity = json.loads(identity_str)  # Deserialize string to dict
        print(f"Deserialized identity: {identity}, type: {type(identity)}")  # Debug log

        if not isinstance(identity, dict):
            print("Invalid JWT identity: Expected a dictionary after deserialization")  # Debug log
            return False, jsonify({'message': 'Invalid token identity: Expected a dictionary'}), 422

        role = identity.get('role')
        if role != 'admin':
            print("Not an admin, rejecting request")  # Debug log
            return False, jsonify({'message': 'Admin access required'}), 403

        return True, identity.get('id')
    except json.JSONDecodeError as e:
        print(f"JWT identity parse error: {e}")  # Debug log
        return False, jsonify({'message': 'Invalid token: Failed to parse identity'}), 422
    except Exception as e:
        print(f"Error in check_admin: {e}")  # Debug log
        return False, jsonify({'message': 'Invalid token'}), 422

@user_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Fetch all users with role 'user'."""
    print("Received GET /api/users request")  # Debug log
    is_admin, response_or_admin_id = check_admin()
    if not is_admin:
        return response_or_admin_id

    try:
        # Fetch users with role 'user'
        users = User.query.filter_by(role='user').all()
        print(f"Found {len(users)} users with role 'user'")  # Debug log
        result = []
        for user in users:
            result.append({
                'id': user.id,
                'name': user.username,
                'email': user.email,
                'quizzes': 0,  # Placeholder, as requested
                'avgScore': 0,  # Placeholder, as requested
                'lastActive': '',  # Placeholder, as requested
                'status': ''  # Placeholder, as requested
            })
        return jsonify(result), 200
    except Exception as e:
        print(f"Error fetching users: {str(e)}")  # Debug log
        return jsonify({'message': f'Error fetching users: {str(e)}'}), 500

@user_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        # Join users and quiz_history to calculate total score per user
        leaderboard = db.session.query(
            User.id,
            User.username.label('name'),
            db.func.coalesce(db.func.sum(QuizHistory.score), 0).label('total_score')
        ).outerjoin(QuizHistory, User.id == QuizHistory.user_id
        ).group_by(User.id, User.username
        ).order_by(db.func.coalesce(db.func.sum(QuizHistory.score), 0).desc()
        ).all()

        result = []
        for rank, (user_id, name, total_score) in enumerate(leaderboard, 1):
            result.append({'id': user_id, 'name': name, 'points': int(total_score), 'rank': rank})

        if not result:
            users = User.query.all()
            result = [{'id': u.id, 'name': u.username, 'points': 0, 'rank': rank} for rank, u in enumerate(users, 1)]

        return jsonify(result), 200
    except SQLAlchemyError as e:
        return jsonify({'message': f'Database error: {str(e)}', 'data': []}), 500
    except Exception as e:
        return jsonify({'message': f'Unexpected error: {str(e)}', 'data': []}), 500