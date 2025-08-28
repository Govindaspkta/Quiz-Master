# 🧠 Quiz App

A modern, interactive quiz application built with a powerful tech stack combining mobile-first design with robust backend capabilities.

## 📱 Screenshots

<div align="center">
  <img src="screenshots/home-screen.png" alt="Home Screen" width="300"/>
  <img src="screenshots/quiz-screen.png" alt="Quiz Screen" width="300"/>
  <img src="screenshots/quiz-results.png" alt="Results Screen" width="300"/>
</div>

*Home Screen | Quiz Interface | Results Dashboard*

## ✨ Features

- **📚 Multiple Quiz Categories** - Science, History, Sports, Technology, and more
- **⏱️ Timed Challenges** - Race against the clock for extra points
- **📊 Progress Tracking** - View your performance analytics and improvement over time
- **🏆 Leaderboards** - Compete with friends and global players
- **🎨 Beautiful UI** - Clean, modern design with smooth animations
- **📱 Cross-Platform** - Works seamlessly on web, iOS, and Android
- **🔐 User Authentication** - Secure login and profile management
- **💾 Offline Support** - Continue playing even without internet connection

## 🛠️ Tech Stack

### Frontend
- **⚛️ React** - Component-based UI library
- **📱 Ionic** - Cross-platform mobile framework
- **🎨 Tailwind CSS** - Utility-first CSS framework

### Backend
- **🐍 Flask** - Python web framework
- **🗄️ MySQL** - Relational database management

### Additional Tools
- **📦 npm/yarn** - Package management
- **🔧 Webpack** - Module bundler
- **📝 ESLint** - Code linting
- **🎯 Prettier** - Code formatting

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- MySQL 8.0+
- Ionic CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quiz-app.git
   cd quiz-app
   ```

2. **Setup Backend (Flask)**
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # Configure database
   mysql -u root -p
   CREATE DATABASE quiz_app;
   
   # Run migrations
   python manage.py db upgrade
   
   # Start Flask server
   python app.py
   ```

3. **Setup Frontend (React + Ionic)**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   ionic serve
   ```

4. **Environment Variables**
   
   Create `.env` file in backend directory:
   ```env
   DATABASE_URL=mysql://username:password@localhost/quiz_app
   SECRET_KEY=your-secret-key
   JWT_SECRET=your-jwt-secret
   ```

## 📂 Project Structure

```
quiz-app/
├── 📁 backend/
│   ├── 📁 app/
│   │   ├── 📄 models.py          # Database models
│   │   ├── 📄 routes.py          # API endpoints
│   │   └── 📄 utils.py           # Helper functions
│   ├── 📄 app.py                 # Flask application
│   └── 📄 requirements.txt       # Python dependencies
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable React components
│   │   ├── 📁 pages/            # Ionic pages
│   │   └── 📁 services/         # API service functions
│   ├── 📄 ionic.config.json     # Ionic configuration
│   └── 📄 tailwind.config.js    # Tailwind CSS config
└── 📄 README.md
```

## 🎮 How to Play

1. **Sign Up/Login** - Create your account or sign in
2. **Choose Category** - Select from available quiz categories
3. **Set Difficulty** - Pick Easy, Medium, or Hard mode
4. **Start Quiz** - Answer questions within the time limit
5. **View Results** - See your score and correct answers
6. **Track Progress** - Monitor your improvement over time

## 📊 Database Schema

### Users Table
- `id` (Primary Key)
- `username`
- `email`
- `password_hash`
- `created_at`

### Quizzes Table
- `id` (Primary Key)
- `title`
- `category`
- `difficulty`
- `time_limit`

### Questions Table
- `id` (Primary Key)
- `quiz_id` (Foreign Key)
- `question_text`
- `correct_answer`
- `options` (JSON)

### User_Scores Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `quiz_id` (Foreign Key)
- `score`
- `completion_time`

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout

### Quizzes
- `GET /tabs/quizzes` - Get all quizzes
- `GET /tabs/quizzes/:id` - Get specific quiz
- `POST /tabs/quizzes/:id/submit` - Submit quiz answers

### User history
- `GET /tabs/history/`

## 🎨 Customization

### Styling with Tailwind CSS
The app uses Tailwind CSS for styling. Key configuration:



### Adding New Quiz Categories
1. Add category to database
2. Create corresponding icons and colors
3. Update frontend category selection

## 🚀 Deployment

### Backend (Flask)
```bash
# Using Heroku
heroku create quiz-app-backend
git subtree push --prefix backend heroku main
```

### Frontend (Ionic)
```bash
# Build for web
ionic build

# Deploy to Firebase/Netlify
# Build for mobile
ionic capacitor build ios
ionic capacitor build android
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@Govindaspkta](https://github.com/Govindaspkta)
- LinkedIn: [Govinda Sapkota](www.linkedin.com/in/govinda-sapkota)
- Email: sapgovinda05@gmail.com

## 🙏 Acknowledgments

- Thanks to the open-source community
- Ionic team for the amazing framework
- React team for the powerful library
- Tailwind CSS for the utility-first approach

---

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white"/>
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white"/>
</div>

<div align="center">
  <strong>⭐ Star this repo if you found it helpful! ⭐</strong>
</div>