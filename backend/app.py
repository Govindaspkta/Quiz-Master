# D:\Practice\Project6th\quiz-app\app.py
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from config.config import Config
from backend.models import db
from routes.auth_routes import auth_bp
from routes.quiz_routes import quiz_bp
from routes.history_routes import history_bp
from routes.categories import category_bp
from routes.questions import question_bp
from routes.users import user_bp
from flask_jwt_extended import JWTManager, get_jwt

migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Updated CORS configuration focusing on web development
    CORS(app, 
         resources={r"/api/*": {
             "origins": [
                 "http://localhost:3000",      # React dev server
                 "http://localhost:8100",      # Ionic dev server (if testing both)
                 "http://localhost"            # General localhost
             ],
             "supports_credentials": True,
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": [
                 "Content-Type", 
                 "Authorization", 
                 "Access-Control-Allow-Credentials",
                 "Access-Control-Allow-Origin",
                 "Access-Control-Allow-Headers",
                 "Access-Control-Allow-Methods"
             ]
         }}, 
         max_age=86400)

    app.config.from_object(Config)

    db.init_app(app)
    jwt = JWTManager(app)
    migrate.init_app(app, db)

    @app.before_request
    def log_request():
        print(f"🚀 Incoming request: {request.method} {request.path}")
        print(f"📱 User-Agent: {request.headers.get('User-Agent', 'Unknown')}")
        print(f"🌍 Origin: {request.headers.get('Origin', 'No Origin')}")
        if request.method == 'OPTIONS':
            print("⚡ CORS Preflight request")

    @app.after_request
    def after_request(response):
        # Additional CORS headers for mobile
        origin = request.headers.get('Origin')
        if origin:
            response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response

    @jwt.unauthorized_loader
    def unauthorized_callback(error_string):
        print(f"❌ JWT Unauthorized Error: {error_string}")
        return jsonify({"message": "Missing or invalid token", "error": error_string}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        print(f"❌ JWT Invalid Token Error: {error_string}")
        return jsonify({"message": "Invalid token", "error": error_string}), 422

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print(f"⏰ JWT Expired Token Error: Token expired for payload {jwt_payload}")
        return jsonify({"message": "Token has expired", "payload": jwt_payload}), 401

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(quiz_bp, url_prefix='/api')
    app.register_blueprint(history_bp, url_prefix='/api')
    app.register_blueprint(category_bp, url_prefix='/api')
    app.register_blueprint(question_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')

    # Health check route for debugging
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy", 
            "message": "Quiz App API is running",
            "endpoints": [
                "/api/auth/login",
                "/api/auth/register", 
                "/api/quizzes",
                "/api/categories",
                "/api/questions",
                "/api/users"
            ]
        }), 200

    # Test route for mobile connectivity
    @app.route('/test', methods=['GET'])
    def test_connection():
        return jsonify({
            "message": "Connection successful!",
            "client_ip": request.remote_addr,
            "user_agent": request.headers.get('User-Agent', 'Unknown')
        }), 200

    return app

if __name__ == '__main__':
    app = create_app()
    print("🚀 Starting Flask server...")
    print("📱 Server accessible at:")
    print("   - Local: http://127.0.0.1:5000")
    print("   - Network: http://192.168.1.74:5000")  # Your WiFi IP
    print("🔧 Test endpoints:")
    print("   - Health: http://192.168.1.74:5000/health")
    print("   - Test: http://192.168.1.74:5000/test")
    app.run(host='0.0.0.0', port=5000, debug=True)