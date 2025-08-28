from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, unset_jwt_cookies
from backend.models import db, User, Admin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
import traceback

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    """Register a new user and log them in automatically."""
    if request.method == 'OPTIONS':
        print("Handling OPTIONS request for /api/auth/register")
        return jsonify({}), 200  # Rely on flask_cors for headers

    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    print(f"Step 1: Received data - username: {username}, email: {email}, full data: {data}")

    if not all([username, email, password]):
        print("Step 2: Missing required fields")
        return jsonify({'message': 'Missing required fields'}), 400

    if len(password) < 8:
        print("Step 3: Password too short")
        return jsonify({'message': 'Password must be at least 8 characters long'}), 400

    email = email.lower().strip()
    print(f"Step 4: Normalized email: {email}")

    existing_user = User.query.filter_by(email=email).first()
    existing_admin = Admin.query.filter_by(email=email).first()
    if existing_user or existing_admin:
        print("Step 5: Email already exists - existing_user: {existing_user}, existing_admin: {existing_admin}")
        return jsonify({'message': 'Email already exists'}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    print("Step 6: Password hashed")

    try:
        new_entity = User(username=username, email=email, password=hashed_password, role='user')
        print("Step 7: Created new user entity - new_entity: {new_entity}")

        db.session.add(new_entity)
        db.session.commit()
        print("Step 8: Entity saved to database - new_entity.id: {new_entity.id}")

        access_token = create_access_token(
            identity=str(new_entity.id),
            additional_claims={'role': 'user'},
            expires_delta=timedelta(hours=1)
        )
        print(f"Step 9: JWT token generated with identity: {str(new_entity.id)}, type: {type(str(new_entity.id))}")

        redirect_to = '/tabs/home'
        print(f"Step 10: Redirect to {redirect_to}")

        return jsonify({
            'message': 'Signed in successfully',
            'token': access_token,
            'role': 'user',
            'redirectTo': redirect_to
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error during signup: {str(e)}, type: {type(e)}, traceback: {traceback.format_exc()}")
        return jsonify({'message': f'Error during signup: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    """Log in a user or admin and return a JWT token."""
    if request.method == 'OPTIONS':
        print("Handling OPTIONS request for /api/auth/login")
        return jsonify({}), 200  # Rely on flask_cors for headers

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'message': 'Missing required fields'}), 400

    email = email.lower().strip()

    user = User.query.filter_by(email=email).first()
    admin = Admin.query.filter_by(email=email).first()

    entity = user or admin
    if not entity:
        return jsonify({'message': 'User not found'}), 404

    if not check_password_hash(entity.password, password):
        return jsonify({'message': 'Password does not match'}), 401

    role = 'admin' if admin else 'user'

    access_token = create_access_token(
        identity=str(entity.id),
        additional_claims={'role': role},
        expires_delta=timedelta(hours=1)
    )
    print(f"Login: JWT token generated with identity: {str(entity.id)}, type: {type(str(entity.id))}")

    redirect_to = '/admin/adminDashboard' if role == 'admin' else '/tabs/home'

    return jsonify({
        'message': 'Login successful',
        'token': access_token,
        'role': role,
        'redirectTo': redirect_to
    }), 200


@auth_bp.route('/profile', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_profile():
    """Fetch the authenticated user's profile data."""
    try:
        print("Profile request received - Headers:", request.headers)
        user_id = get_jwt_identity()
        print(f"JWT Identity: {user_id}")
        user = User.query.get(user_id)
        if not user:
            print(f"User not found for ID: {user_id}")
            return jsonify({'message': 'User not found'}), 404

        profile_data = {
            'username': user.username,
            'email': user.email
        }
        print(f"Returning profile data: {profile_data}")
        return jsonify(profile_data), 200
    except Exception as e:
        print(f"Error fetching profile: {str(e)}, traceback: {traceback.format_exc()}")
        return jsonify({'message': 'Error fetching profile data', 'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST', 'OPTIONS'])
@jwt_required()
def logout():
    """Log out a user or admin by invalidating the JWT token."""
    if request.method == 'OPTIONS':
        print("Handling OPTIONS request for /api/auth/logout")
        return jsonify({}), 200  # Rely on flask_cors for headers

    response = jsonify({'message': 'Logout successful'})
    unset_jwt_cookies(response)
    return response, 200