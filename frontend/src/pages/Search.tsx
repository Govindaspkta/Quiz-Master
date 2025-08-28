import React, { useState, useEffect } from 'react';

// Define the Quiz type based on the data structure
interface Quiz {
  id: number;
  title: string;
  category_id: number;
  difficulty: string;
  created_at: string;
  is_active: number;
  admin_id: number;
  description: string;
  time_limit: number;
}

const QuizSearchPage: React.FC = () => {
  // Mock data with explicit type
  const [quizzes] = useState<Quiz[]>([
    {
      id: 1,
      title: 'sdfsd',
      category_id: 2,
      difficulty: 'medium',
      created_at: '2025-05-06 16:30:56',
      is_active: 1,
      admin_id: 1,
      description: 'sdfsdfsdfsd',
      time_limit: 10,
    },
    {
      id: 2,
      title: 'Entrepreneurship Basics',
      category_id: 11,
      difficulty: 'medium',
      created_at: '2025-05-06 16:52:34',
      is_active: 1,
      admin_id: 1,
      description: '',
      time_limit: 3,
    },
    {
      id: 5,
      title: 'Basic Science Quiz',
      category_id: 2,
      difficulty: 'easy',
      created_at: '2025-05-10 18:37:11',
      is_active: 1,
      admin_id: 1,
      description: 'Test your fundamental knowledge of general science',
      time_limit: 3,
    },
    {
      id: 6,
      title: 'IQ and Logic Challenge',
      category_id: 8,
      difficulty: 'medium',
      created_at: '2025-05-29 19:12:04',
      is_active: 1,
      admin_id: 1,
      description: 'Challenge your logical thinking and problem-solving skills',
      time_limit: 1,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>(quizzes);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Get unique difficulties and categories
  const difficulties = ['all', ...new Set(quizzes.map(quiz => quiz.difficulty))] as const;
  const categories = ['all', ...new Set(quizzes.map(quiz => quiz.category_id.toString()))];

  // Define categoryNames with an index signature
  const categoryNames: { [key: string]: string } = {
    '2': 'Science',
    '8': 'Logic & IQ',
    '11': 'Business',
  };

  useEffect(() => {
    const filtered = quizzes.filter(quiz => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === 'all' || quiz.category_id.toString() === selectedCategory;

      return matchesSearch && matchesDifficulty && matchesCategory && quiz.is_active === 1;
    });

    setFilteredQuizzes(filtered);
  }, [searchTerm, selectedDifficulty, selectedCategory, quizzes]);

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'var(--primary-dark)',
          color: 'white',
          padding: '1rem',
          paddingTop: '3rem',
        }}
      >
        <h1 className="text-2xl font-bold mb-4">Quiz Search</h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-lg">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{
              background: 'white',
              color: 'var(--primary-dark)',
            }}
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{
            background: 'var(--accent-gold)',
            color: 'var(--primary-dark)',
          }}
        >
          <span>⚙️</span>
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 border-b" style={{ background: '#f8f9fa' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Categories</option>
                {categories
                  .filter(cat => cat !== 'all')
                  .map(cat => (
                    <option key={cat} value={cat}>
                      {categoryNames[cat] || `Category ${cat}`}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''} found
          </p>
        </div>

        {/* Quiz Cards */}
        <div className="space-y-4">
          {filteredQuizzes.map(quiz => (
            <div
              key={quiz.id}
              className="rounded-lg shadow-md p-4 transition-transform hover:scale-105"
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--primary-dark)' }}>
                  {quiz.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    quiz.difficulty
                  )}`}
                >
                  {quiz.difficulty}
                </span>
              </div>

              {quiz.description && (
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {quiz.description}
                </p>
              )}

              <div
                className="flex items-center justify-between text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span>📚</span>
                    <span>{categoryNames[quiz.category_id.toString()] || `Category ${quiz.category_id}`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{quiz.time_limit} min</span>
                  </div>
                </div>
                <span className="text-xs">{formatDate(quiz.created_at)}</span>
              </div>

              <button
                className="w-full mt-4 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, var(--accent-gold), var(--accent-yellow))',
                  color: 'var(--primary-dark)',
                  border: 'none',
                }}
                onClick={() => console.log('Start quiz:', quiz.id)}
              >
                Start Quiz
              </button>
            </div>
          ))}
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSearchPage;