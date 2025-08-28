import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSkeletonText,
  IonButton,
  IonButtons,
  isPlatform
} from '@ionic/react';
import { 
  trophyOutline, 
  timeOutline, 
  flameOutline,
  medalOutline,
  personOutline,
  globeOutline,
  peopleOutline,
  ribbonOutline,
  arrowBackOutline
} from 'ionicons/icons';
import '../theme/variables.css';
import BackButton from '../components/BackButton';

// Platform-specific styling adjustments
const getPlatformStyles = () => {
  return isPlatform('ios') ? {
    cardBorderRadius: '16px',
    sectionPadding: '16px',
    headerPadding: '8px 16px'
  } : {
    cardBorderRadius: '12px',
    sectionPadding: '12px',
    headerPadding: '8px 12px'
  };
};

interface LeaderboardUser {
  id: number;
  name: string;
  image: string;
  points: number;
  rank: number;
  quizzesTaken: number;
  winRate: number;
  isCurrentUser?: boolean;
}

const Leaderboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [scope, setScope] = useState<'global' | 'friends'>('global');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);
  const platformStyles = getPlatformStyles();
  
  // Fetch leaderboard data
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      // Mock data
      const mockUsers: LeaderboardUser[] = [
        { id: 1, name: 'Alex', image: '/api/placeholder/100/100', points: 12350, rank: 1, quizzesTaken: 47, winRate: 92 },
        { id: 2, name: 'Taylor', image: '/api/placeholder/100/100', points: 10980, rank: 2, quizzesTaken: 38, winRate: 89 },
        { id: 3, name: 'Jordan', image: '/api/placeholder/100/100', points: 9870, rank: 3, quizzesTaken: 35, winRate: 86 },
        { id: 4, name: 'Morgan', image: '/api/placeholder/100/100', points: 8740, rank: 4, quizzesTaken: 29, winRate: 84 },
        { id: 5, name: 'Casey', image: '/api/placeholder/100/100', points: 8120, rank: 5, quizzesTaken: 26, winRate: 78 },
        { id: 6, name: 'Quinn', image: '/api/placeholder/100/100', points: 7560, rank: 6, quizzesTaken: 24, winRate: 75 },
        { id: 7, name: 'Riley', image: '/api/placeholder/100/100', points: 6980, rank: 7, quizzesTaken: 21, winRate: 72 },
        { id: 8, name: 'Avery', image: '/api/placeholder/100/100', points: 6540, rank: 8, quizzesTaken: 20, winRate: 69 },
        { id: 9, name: 'You', image: '/api/placeholder/100/100', points: 5720, rank: 9, quizzesTaken: 18, winRate: 67, isCurrentUser: true },
        { id: 10, name: 'Cameron', image: '/api/placeholder/100/100', points: 5130, rank: 10, quizzesTaken: 16, winRate: 65 },
      ];
      
      setUsers(mockUsers.filter(user => !user.isCurrentUser));
      setCurrentUserRank(mockUsers.find(user => user.isCurrentUser) || null);
      setLoading(false);
    }, 1000);
  }, [timeFrame, scope]);
  
  // Get medal icon for top 3
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: medalOutline, color: '#FFD700' }; // Gold
      case 2:
        return { icon: medalOutline, color: '#C0C0C0' }; // Silver
      case 3:
        return { icon: medalOutline, color: '#CD7F32' }; // Bronze
      default:
        return { icon: null, color: 'transparent' };
    }
  };
  
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--accent-gold)' }}>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <div className="text-xl font-bold text-center text-[var(--primary-dark)]">Leaderboard</div>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        {/* Time Frame Segmented Control */}
        <div className="mb-4">
          <IonSegment value={timeFrame} onIonChange={e => setTimeFrame(e.detail.value as any)}>
            <IonSegmentButton value="weekly">
              <IonLabel>Weekly</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="monthly">
              <IonLabel>Monthly</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="allTime">
              <IonLabel>All Time</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>
        
        {/* Scope Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-full p-1 inline-flex">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${scope === 'global' ? 'bg-white shadow text-[var(--primary-dark)]' : 'text-gray-500'}`}
              onClick={() => setScope('global')}
            >
              <div className="flex items-center">
                <IonIcon icon={globeOutline} className="mr-1" />
                Global
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${scope === 'friends' ? 'bg-white shadow text-[var(--primary-dark)]' : 'text-gray-500'}`}
              onClick={() => setScope('friends')}
            >
              <div className="flex items-center">
                <IonIcon icon={peopleOutline} className="mr-1" />
                Friends
              </div>
            </button>
          </div>
        </div>
        
        {/* Top 3 Podium */}
        {!loading && users.length > 0 && (
          <div className="flex justify-center items-end mb-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center mx-2">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C0C0C0] mb-2">
                <img src={users[1].image} alt={users[1].name} className="w-full h-full object-cover" />
              </div>
              <div className="bg-[#C0C0C0] w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mb-1">
                2
              </div>
              <div className="h-20 w-20 bg-gray-100 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="font-medium text-sm truncate max-w-full px-2">{users[1].name}</div>
                  <div className="text-xs text-gray-500">{users[1].points.toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            {/* 1st Place */}
            <div className="flex flex-col items-center z-10">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#FFD700] mb-2">
                  <img src={users[0].image} alt={users[0].name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex">
                    <IonIcon icon={trophyOutline} className="text-[#FFD700] text-3xl" />
                  </div>
                </div>
              </div>
              <div className="bg-[#FFD700] w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-1">
                1
              </div>
              <div className="h-28 w-24 bg-gray-100 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="font-bold text-sm truncate max-w-full px-2">{users[0].name}</div>
                  <div className="text-xs text-gray-500">{users[0].points.toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            {/* 3rd Place */}
            <div className="flex flex-col items-center mx-2">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#CD7F32] mb-2">
                <img src={users[2].image} alt={users[2].name} className="w-full h-full object-cover" />
              </div>
              <div className="bg-[#CD7F32] w-7 h-7 rounded-full flex items-center justify-center text-white font-bold mb-1">
                3
              </div>
              <div className="h-16 w-18 bg-gray-100 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="font-medium text-sm truncate max-w-full px-2">{users[2].name}</div>
                  <div className="text-xs text-gray-500">{users[2].points.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Leaderboard List */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-4">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="font-bold text-sm text-gray-500">Rank</div>
              <div className="font-bold text-sm text-gray-500">Player</div>
              <div className="font-bold text-sm text-gray-500">Points</div>
            </div>
          </div>
          
          {/* Loading Skeleton */}
          {loading && (
            <div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center">
                    <IonSkeletonText animated style={{ width: '30px', height: '30px', borderRadius: '15px' }} />
                    <div className="ml-3 flex-1">
                      <IonSkeletonText animated style={{ width: '70%', height: '16px' }} />
                      <IonSkeletonText animated style={{ width: '40%', height: '14px' }} />
                    </div>
                    <IonSkeletonText animated style={{ width: '60px', height: '16px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* User List */}
          {!loading && (
            <div>
              {users.slice(3).map((user) => (
                <div 
                  key={user.id} 
                  className={`px-4 py-3 border-b border-gray-100 flex items-center ${user.isCurrentUser ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-center w-8 mr-2">
                    <div className="text-center font-bold text-gray-500">{user.rank}</div>
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {user.name}
                      {user.isCurrentUser && <span className="ml-1 text-xs text-blue-600">(You)</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.quizzesTaken} quizzes • {user.winRate}% win rate
                    </div>
                  </div>
                  <div className="font-bold">{user.points.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Current User Rank Card */}
        {!loading && currentUserRank && (
          <div className="bg-blue-50 rounded-xl overflow-hidden shadow-md mb-20">
            <div className="px-4 py-3 border-b border-blue-100">
              <div className="text-sm font-medium text-blue-800">Your Ranking</div>
            </div>
            <div className="px-4 py-3 flex items-center">
              <div className="flex items-center justify-center w-8 mr-2">
                <div className="text-center font-bold text-blue-600">{currentUserRank.rank}</div>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img src={currentUserRank.image} alt={currentUserRank.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{currentUserRank.name} <span className="ml-1 text-xs text-blue-600">(You)</span></div>
                <div className="text-xs text-gray-600">
                  {currentUserRank.quizzesTaken} quizzes • {currentUserRank.winRate}% win rate
                </div>
              </div>
              <div className="font-bold text-blue-800">{currentUserRank.points.toLocaleString()}</div>
            </div>
            <div className="px-4 py-3 bg-blue-100">
              <div className="flex justify-between items-center text-xs text-blue-800">
                <div>Points to next rank: <span className="font-bold">1,260</span></div>
                <div>Top 6% of all players</div>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Leaderboard;