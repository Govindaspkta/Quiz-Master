from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from backend.models import db, Category, Quiz
from sqlalchemy.exc import IntegrityError
import json

category_bp = Blueprint('categories', __name__)

# Helper function to check if user is admin
def check_admin():
    try:
        user_id = get_jwt_identity()  # Returns the string ID
        print(f"Identity from JWT: {user_id}, Type: {type(user_id)}")

        # Get the role from JWT claims
        claims = get_jwt()
        role = claims.get('role')
        print(f"User role from claims: {role}")

        # Allow GET requests for non-admins, restrict other methods to admins
        if request.method == 'GET':
            return True, int(user_id)
        if role != 'admin':
            print("Not an admin, rejecting request")
            return False, (jsonify({'message': 'Admin access required'}), 403)

        return True, int(user_id)  # Convert to int for database queries
    except Exception as e:
        print(f"Error in check_admin: {e}")
        return False, (jsonify({'message': 'Invalid token'}), 422)

@category_bp.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    """Fetch all categories."""
    print("Received GET /categories request")
    try:
        is_admin, result = check_admin()
        if not is_admin:
            response, status = result
            return response, status

        categories = Category.query.all()
        print(f"Found {len(categories)} categories")
        result = []
        for category in categories:
            quiz_count = Quiz.query.filter_by(category_id=category.id).count()
            print(f"Category {category.id}: {quiz_count} quizzes")
            result.append({
                'id': category.id,
                'name': category.name,
                'description': category.description,
                'icon': category.icon,
                'isActive': category.is_active,
                'quizCount': quiz_count
            })
        return jsonify(result), 200
    except Exception as e:
        print(f"Error fetching categories: {str(e)}")
        return jsonify({'message': f'Error fetching categories: {str(e)}'}), 500

@category_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    """Create a new category."""
    print("Received POST /categories request")
    is_admin, result = check_admin()
    if not is_admin:
        response, status = result
        return response, status

    data = request.get_json()
    print(f"Request data: {data}")
    name = data.get('name')
    description = data.get('description', '')
    icon = data.get('icon', '📚')
    is_active = data.get('isActive', True)

    if not name:
        print("Missing category name")
        return jsonify({'message': 'Category name is required'}), 400

    try:
        new_category = Category(
            name=name,
            description=description,
            icon=icon,
            is_active=is_active,
            admin_id=result  # Use the user_id from check_admin
        )
        db.session.add(new_category)
        db.session.commit()
        print("Committed category to database")
        return jsonify({
            'id': new_category.id,
            'name': new_category.name,
            'description': new_category.description,
            'icon': new_category.icon,
            'isActive': new_category.is_active,
            'quizCount': 0
        }), 201
    except IntegrityError as e:
        db.session.rollback()
        print(f"IntegrityError: {str(e)}")
        return jsonify({'message': 'Category name already exists'}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error creating category: {str(e)}")
        return jsonify({'message': f'Error creating category: {str(e)}'}), 500

@category_bp.route('/categories/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """Update an existing category."""
    print(f"Received PUT /categories/{category_id} request")
    is_admin, result = check_admin()
    if not is_admin:
        response, status = result
        return response, status

    category = Category.query.get_or_404(category_id)
    data = request.get_json()
    print(f"Request data: {data}")
    name = data.get('name', category.name)
    description = data.get('description', category.description)
    icon = data.get('icon', category.icon)
    is_active = data.get('isActive', category.is_active)

    if not name:
        print("Missing category name")
        return jsonify({'message': 'Category name is required'}), 400

    try:
        category.name = name
        category.description = description
        category.icon = icon
        category.is_active = is_active
        db.session.commit()
        print("Updated category in database")
        quiz_count = Quiz.query.filter_by(category_id=category.id).count()
        return jsonify({
            'id': category.id,
            'name': category.name,
            'description': category.description,
            'icon': category.icon,
            'isActive': category.is_active,
            'quizCount': quiz_count
        }), 200
    except IntegrityError as e:
        db.session.rollback()
        print(f"IntegrityError: {str(e)}")
        return jsonify({'message': 'Category name already exists'}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error updating category: {str(e)}")
        return jsonify({'message': f'Error updating category: {str(e)}'}), 500

@category_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """Delete a category."""
    print(f"Received DELETE /categories/{category_id} request")
    is_admin, result = check_admin()
    if not is_admin:
        response, status = result
        return response, status

    category = Category.query.get_or_404(category_id)
    try:
        db.session.delete(category)
        db.session.commit()
        print("Deleted category from database")
        return jsonify({'message': 'Category deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting category: {str(e)}")
        return jsonify({'message': f'Error deleting category: {str(e)}'}), 500