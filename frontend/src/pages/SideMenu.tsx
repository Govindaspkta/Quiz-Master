import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonAvatar,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonList,
  IonListHeader
} from '@ionic/react';
import {
  playOutline,
  trophyOutline,
  statsChartOutline,
  settingsOutline,
  personOutline,
  helpCircleOutline,
  bookOutline,
  timeOutline,
  starOutline,
  flashOutline,
  schoolOutline,
  gameControllerOutline,
  medalOutline,
  libraryOutline
} from 'ionicons/icons';

const Menu = () => {
  
  const [selectedSegment, setSelectedSegment] = useState('quiz');

  const quizCategories = [
    { id: 1, title: 'Science & Technology', icon: schoolOutline, color: 'bg-blue-500', questions: 120 },
    { id: 2, title: 'History & Geography', icon: libraryOutline, color: 'bg-green-500', questions: 95 },
    { id: 3, title: 'Sports & Entertainment', icon: gameControllerOutline, color: 'bg-purple-500', questions: 80 },
    { id: 4, title: 'General Knowledge', icon: bookOutline, color: 'bg-orange-500', questions: 150 }
  ];

  const gameMode = [
    { title: 'Quick Quiz', subtitle: '10 random questions', icon: flashOutline, duration: '5 min' },
    { title: 'Challenge Mode', subtitle: 'Progressive difficulty', icon: trophyOutline, duration: '15 min' },
    { title: 'Time Attack', subtitle: 'Beat the clock', icon: timeOutline, duration: '3 min' },
    { title: 'Practice Mode', subtitle: 'Learn at your pace', icon: bookOutline, duration: 'Unlimited' }
  ];

  const achievements = [
    { title: 'Quiz Master', description: 'Complete 50 quizzes', progress: 75, icon: starOutline },
    { title: 'Speed Runner', description: 'Complete quiz under 2 min', progress: 100, icon: flashOutline },
    { title: 'Knowledge Seeker', description: 'Try all categories', progress: 50, icon: bookOutline }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--primary-dark)' }}>
          <IonTitle className="text-white font-bold">QuizMaster</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding scrollbar-hide" style={{ '--background': 'var(--background)' }}>
        {/* User Profile Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <IonAvatar className="w-16 h-16">
                <img src="https://via.placeholder.com/64x64/CCA000/001D3D?text=U" alt="User Avatar" />
              </IonAvatar>
              <div>
                <h2 className="text-xl font-bold">Welcome back!</h2>
                <p className="text-blue-200">Level 12 • 2,450 XP</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">85%</div>
              <div className="text-sm text-blue-200">Accuracy</div>
            </div>
          </div>
          
          <div className="flex justify-between mt-4 pt-4 border-t border-blue-600">
            <div className="text-center">
              <div className="text-lg font-semibold">47</div>
              <div className="text-xs text-blue-200">Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">12</div>
              <div className="text-xs text-blue-200">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">8th</div>
              <div className="text-xs text-blue-200">Rank</div>
            </div>
          </div>
        </div>

        {/* Segment Control */}
        <IonSegment 
          value={selectedSegment} 
          onIonChange={e => setSelectedSegment(e.detail.value as string)}
          className="mb-6"
        >
          <IonSegmentButton value="quiz">
            <IonLabel>Quiz Categories</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="modes">
            <IonLabel>Game Modes</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="progress">
            <IonLabel>Progress</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Quiz Categories */}
        {selectedSegment === 'quiz' && (
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Choose Your Category
            </h3>
            <IonGrid>
              <IonRow>
                {quizCategories.map((category) => (
                  <IonCol size="12" sizeMd="6" key={category.id}>
                    <IonCard className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                      <IonCardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center`}>
                            <IonIcon icon={category.icon} className="text-white text-xl" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{category.title}</h4>
                            <p className="text-sm text-gray-500">{category.questions} questions</p>
                          </div>
                          <IonIcon icon={playOutline} className="text-gray-400" />
                        </div>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>
        )}

        {/* Game Modes */}
        {selectedSegment === 'modes' && (
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Game Modes
            </h3>
            <IonList>
              {gameMode.map((mode, index) => (
                <IonCard key={index} className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
                  <IonItem button>
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center mr-4">
                      <IonIcon icon={mode.icon} className="text-white text-xl" />
                    </div>
                    <IonLabel>
                      <h3 className="font-semibold">{mode.title}</h3>
                      <p className="text-sm text-gray-500">{mode.subtitle}</p>
                    </IonLabel>
                    <IonBadge color="light" className="ml-2">
                      {mode.duration}
                    </IonBadge>
                  </IonItem>
                </IonCard>
              ))}
            </IonList>
          </div>
        )}

        {/* Progress & Achievements */}
        {selectedSegment === 'progress' && (
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Your Progress
            </h3>
            
            {/* Stats Cards */}
            <IonGrid className="mb-6">
              <IonRow>
                <IonCol size="6">
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <IonIcon icon={trophyOutline} className="text-green-600 text-2xl mb-2" />
                    <div className="text-2xl font-bold text-green-600">47</div>
                    <div className="text-sm text-green-500">Completed</div>
                  </div>
                </IonCol>
                <IonCol size="6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <IonIcon icon={starOutline} className="text-blue-600 text-2xl mb-2" />
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-blue-500">Day Streak</div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>

            {/* Achievements */}
            <IonListHeader>
              <IonLabel className="font-semibold">Achievements</IonLabel>
            </IonListHeader>
            
            {achievements.map((achievement, index) => (
              <IonCard key={index} className="mb-3">
                <IonCardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      achievement.progress === 100 ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <IonIcon 
                        icon={achievement.progress === 100 ? medalOutline : achievement.icon} 
                        className={`text-xl ${achievement.progress === 100 ? 'text-white' : 'text-gray-600'}`} 
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${achievement.progress === 100 ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{achievement.progress}%</div>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="mt-8 space-y-3">
          <IonButton 
            expand="block" 
            className="custom-gradient-button h-14"
            style={{
              '--background': 'linear-gradient(90deg, var(--accent-gold), var(--accent-yellow))',
              '--color': 'var(--primary-dark)'
            }}
          >
            <IonIcon icon={playOutline} slot="start" />
            Start Random Quiz
          </IonButton>
          
          <div className="grid grid-cols-2 gap-3">
            <IonButton fill="outline" expand="block" className="h-12">
              <IonIcon icon={statsChartOutline} slot="start" />
              Statistics
            </IonButton>
            <IonButton fill="outline" expand="block" className="h-12">
              <IonIcon icon={settingsOutline} slot="start" />
              Settings
            </IonButton>
          </div>
        </div>

        {/* Bottom Menu Items */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <IonList>
            <IonItem button>
              <IonIcon icon={personOutline} slot="start" />
              <IonLabel>Profile & Account</IonLabel>
            </IonItem>
            <IonItem button>
              <IonIcon icon={helpCircleOutline} slot="start" />
              <IonLabel>Help & Support</IonLabel>
            </IonItem>
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Menu;
