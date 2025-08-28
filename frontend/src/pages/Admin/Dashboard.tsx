import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton,
  IonIcon,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonChip,
  IonLabel
} from '@ionic/react';
import { 
  addOutline, 
  analyticsOutline, 
  peopleOutline, 
  libraryOutline, 
  helpCircleOutline,
  trendingUpOutline,
  trendingDownOutline,
  ellipse,
  personOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

// Mock data for dashboard stats
const MOCK_STATS = {
  totalUsers: 12458,
  activeUsers: 8765,
  totalQuizzes: 245,
  completedQuizzes: 156894,
  averageScore: 76.5,
  recentUsers: [
    { id: 1, name: 'Alex Johnson', email: 'alex@example.com', joined: '2 days ago', status: 'active' },
    { id: 2, name: 'Sarah Williams', email: 'sarah@example.com', joined: '3 days ago', status: 'active' },
    { id: 3, name: 'Miguel Garcia', email: 'miguel@example.com', joined: '1 week ago', status: 'inactive' }
  ],
  recentQuizzes: [
    { id: 1, title: 'Advanced Physics', category: 'Science', created: '1 day ago', attempts: 125 },
    { id: 2, title: 'World Geography', category: 'Geography', created: '3 days ago', attempts: '87' },
    { id: 3, title: 'JavaScript Basics', category: 'Technology', created: '5 days ago', attempts: 156 }
  ],
  categoryStats: [
    { name: 'Science', quizCount: 45, userCompletions: 5672 },
    { name: 'History', quizCount: 32, userCompletions: 4231 },
    { name: 'Technology', quizCount: 38, userCompletions: 6754 },
    { name: 'Mathematics', quizCount: 41, userCompletions: 3985 }
  ]
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setStats(MOCK_STATS);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const navigateToPage = (path: string) => {
    console.log('Navigating to:', path);
    history.push(path);
  };

  // Dashboard quick action buttons
  const quickActions = [
    { icon: addOutline, title: 'New Quiz', path: '/admin/createQuiz', color: 'bg-primary', action: navigateToPage },
    { icon: analyticsOutline, title: 'Analytics', path: '/admin/adminanalytics', color: 'bg-secondary', action: navigateToPage },
    { icon: peopleOutline, title: 'Users', path: '/admin/users', color: 'bg-tertiary', action: navigateToPage },
    { icon: libraryOutline, title: 'Categories', path: '/admin/category', color: 'bg-success', action: navigateToPage },
    { icon: helpCircleOutline, title: 'Questions', path: '/admin/quizQuestion', color: 'bg-warning', action: navigateToPage },
    { icon: personOutline, title: 'Profile', path: '/admin/adminprofile', color: 'bg-danger', action: navigateToPage }
  ];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="bg-white dark:bg-primary-dark">
          <IonMenuButton slot="start" className="text-primary-dark dark:text-accent-yellow" />
          <IonTitle className="text-primary-dark dark:text-accent-yellow font-bold">Admin Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="bg-gray-50 dark:bg-primary-dark">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <IonSpinner name="crescent" color="primary" />
          </div>
        ) : (
          <div className="p-4">
            {/* Quick Actions */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-primary-dark dark:text-accent-yellow mb-4">Quick Actions</h2>
              <div className="grid grid-cols-3 gap-3">
                {quickActions.map((action, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg ${action.color} text-white cursor-pointer transition-transform duration-200 transform hover:scale-105 shadow-md`}
                    onClick={() => action.action(action.path || '')}
                    style={{ background: 'var(--ion-color-primary)', color: 'white' }}
                  >
                    <IonIcon icon={action.icon} className="text-2xl mb-1" />
                    <div className="text-xs font-medium text-center">{action.title}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats overview */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <IonCard className="m-0 rounded-lg shadow-md">
                <IonCardContent className="p-4">
                  <div className="text-3xl font-bold text-primary-dark dark:text-accent-yellow">{stats.totalUsers.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Users</div>
                  <div className="text-xs flex items-center mt-2 text-green-500">
                    <IonIcon icon={trendingUpOutline} className="mr-1" />
                    +12% this month
                  </div>
                </IonCardContent>
              </IonCard>
              
              <IonCard className="m-0 rounded-lg shadow-md">
                <IonCardContent className="p-4">
                  <div className="text-3xl font-bold text-primary-dark dark:text-accent-yellow">{stats.totalQuizzes.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Quizzes</div>
                  <div className="text-xs flex items-center mt-2 text-green-500">
                    <IonIcon icon={trendingUpOutline} className="mr-1" />
                    +8% this month
                  </div>
                </IonCardContent>
              </IonCard>
              
              <IonCard className="m-0 rounded-lg shadow-md">
                <IonCardContent className="p-4">
                  <div className="text-3xl font-bold text-primary-dark dark:text-accent-yellow">{stats.completedQuizzes.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Completed Quizzes</div>
                  <div className="text-xs flex items-center mt-2 text-green-500">
                    <IonIcon icon={trendingUpOutline} className="mr-1" />
                    +15% this month
                  </div>
                </IonCardContent>
              </IonCard>
              
              <IonCard className="m-0 rounded-lg shadow-md">
                <IonCardContent className="p-4">
                  <div className="text-3xl font-bold text-primary-dark dark:text-accent-yellow">{stats.averageScore}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Average Score</div>
                  <div className="text-xs flex items-center mt-2 text-red-500">
                    <IonIcon icon={trendingDownOutline} className="mr-1" />
                    -2% this month
                  </div>
                </IonCardContent>
              </IonCard>
            </div>
            
            {/* Recent Activity */}
            <IonCard className="m-0 rounded-lg shadow-md mb-6">
              <IonCardHeader className="p-4 pb-2">
                <IonCardTitle className="text-lg font-bold text-primary-dark dark:text-accent-yellow">Recent Users</IonCardTitle>
              </IonCardHeader>
              <IonCardContent className="p-4 pt-2">
                {stats.recentUsers.map((user: any, index: number) => (
                  <div key={user.id} className={`flex items-center justify-between py-2 ${index !== stats.recentUsers.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                    <div>
                      <div className="font-medium text-primary-dark dark:text-white">{user.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mr-3">{user.joined}</div>
                      <IonChip 
                        className={`m-0 ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        style={{ fontSize: '0.65rem', height: '20px' }}
                      >
                        <IonIcon icon={ellipse} className={user.status === 'active' ? 'text-green-500' : 'text-gray-500'} />
                        <IonLabel>{user.status}</IonLabel>
                      </IonChip>
                    </div>
                  </div>
                ))}
                <IonButton 
                  fill="clear" 
                  expand="block" 
                  className="mt-2 text-primary dark:text-accent-yellow"
                  onClick={() => navigateToPage('/admin/users')}
                >
                  View All Users
                </IonButton>
              </IonCardContent>
            </IonCard>

            {/* Recent Quizzes */}
            <IonCard className="m-0 rounded-lg shadow-md mb-6">
              <IonCardHeader className="p-4 pb-2">
                <IonCardTitle className="text-lg font-bold text-primary-dark dark:text-accent-yellow">Recent Quizzes</IonCardTitle>
              </IonCardHeader>
              <IonCardContent className="p-4 pt-2">
                {stats.recentQuizzes.map((quiz: any, index: number) => (
                  <div key={quiz.id} className={`flex items-center justify-between py-2 ${index !== stats.recentQuizzes.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                    <div>
                      <div className="font-medium text-primary-dark dark:text-white">{quiz.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{quiz.category}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mr-3">{quiz.created}</div>
                      <div className="text-xs font-medium bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                        {quiz.attempts} attempts
                      </div>
                    </div>
                  </div>
                ))}
                <IonButton 
                  fill="clear" 
                  expand="block" 
                  className="mt-2 text-primary dark:text-accent-yellow"
                  onClick={() => navigateToPage('/admin/quizzes')}
                >
                  View All Quizzes
                </IonButton>
              </IonCardContent>
            </IonCard>

            {/* Category Statistics */}
            <IonCard className="m-0 rounded-lg shadow-md mb-6">
              <IonCardHeader className="p-4 pb-2">
                <IonCardTitle className="text-lg font-bold text-primary-dark dark:text-accent-yellow">Category Statistics</IonCardTitle>
              </IonCardHeader>
              <IonCardContent className="p-4 pt-2">
                {stats.categoryStats.map((category: any, index: number) => (
                  <div key={index} className={`py-2 ${index !== stats.categoryStats.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                    <div className="flex justify-between mb-1">
                      <div className="font-medium text-primary-dark dark:text-white">{category.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{category.quizCount} quizzes</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (category.userCompletions / 100))}%`, background: 'var(--accent-gold)' }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {category.userCompletions.toLocaleString()} completions
                    </div>
                  </div>
                ))}
                <IonButton 
                  fill="clear" 
                  expand="block" 
                  className="mt-2 text-primary dark:text-accent-yellow"
                  onClick={() => navigateToPage('/admin/categories')}
                >
                  Manage Categories
                </IonButton>
              </IonCardContent>
            </IonCard>

            {/* Manage Quizzes Section */}
            <IonCard className="m-0 rounded-lg shadow-md mb-6">
              <IonCardHeader className="p-4 pb-2">
                <IonCardTitle className="text-lg font-bold text-primary-dark dark:text-accent-yellow">Manage Quizzes</IonCardTitle>
              </IonCardHeader>
              <IonCardContent className="p-4 pt-2">
                <p className="text-gray-600 dark:text-gray-300 mb-4">Manage and edit your quizzes here. View, update, or delete existing quizzes.</p>
                <IonButton 
                  fill="clear" 
                  expand="block" 
                  className="mt-2 text-primary dark:text-accent-yellow"
                  onClick={() => navigateToPage('/admin/manageQuizes')}
                >
                  Go to Manage Quizzes
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;