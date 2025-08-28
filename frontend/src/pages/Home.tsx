import React, { useCallback, useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonIcon,
  IonButton,
  IonSearchbar,
  IonLabel,
  IonButtons,
  IonToast,
  isPlatform,
  IonSpinner
} from '@ionic/react';
import { 
  trophyOutline, 
  timeOutline, 
  bulbOutline,
  flameOutline,
  briefcaseOutline,
  laptopOutline,
  cubeOutline,
  timerOutline,
  infiniteOutline,
  thunderstormOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom'; 
import '../theme/variables.css';
import BackButton from '../components/BackButton';
import api from '../utils/api';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}

interface FrontendCategory {
  id: number;
  name: string;
  icon: string | any;
  color: string;
  quizzes: number;
}

interface QuizMode {
  id: number;
  title: string;
  description: string;
  icon: string | any;
  color: string;
  questions: number;
  plays: number;
}

interface LeaderboardUser {
  id: number;
  name: string;
  points: number;
  rank: number;
}

const Home: React.FC = () => {
  const getPlatformStyles = () => {
    return {
      cardBorderRadius: isPlatform('ios') ? '16px' : '12px',
      sectionPadding: isPlatform('ios') ? '16px' : '12px',
      headerPadding: isPlatform('ios') ? '8px 16px' : '8px 12px',
      contentPaddingBottom: isPlatform('ios') ? '80px' : '70px',
    };
  };

  const history = useHistory();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<FrontendCategory[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const platformStyles = getPlatformStyles();

  const quizModes: QuizMode[] = [
    { id: 1, title: 'RapidFire', description: 'Quick 60-second challenges', icon: timerOutline, color: '#e63946', questions: 5, plays: 2345 },
    { id: 2, title: 'TimeFree', description: 'No time limits, play at your pace', icon: infiniteOutline, color: '#2a9d8f', questions: 20, plays: 1872 },
    { id: 3, title: 'HardMode', description: 'For quiz masters only', icon: thunderstormOutline, color: '#7209b7', questions: 10, plays: 1068 }
  ];

  const fallbackCategories: FrontendCategory[] = [
    { id: -1, name: 'General Knowledge', icon: cubeOutline, color: '#7209b7', quizzes: 10 },
    { id: -2, name: 'History', icon: timeOutline, color: '#f4a261', quizzes: 8 }
  ];

  const fetchCategories = async () => {
    const colors = [
      '#7209b7', '#f4a261', '#2a9d8f', '#e63946',
      '#4361ee', '#ff9100', '#00b4d8', '#7cb518'
    ];

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching categories with token:', token);
      const response = await api.get('/api/categories');
      console.log('Categories API response:', response.data);

      if (Array.isArray(response.data)) {
        const mappedCategories: FrontendCategory[] = response.data.map((category: any, index: number) => {
          let iconValue: string | any = category.icon || '';
          const categoryName = (category.name || category.category_name || 'Unnamed Category').toLowerCase();

          if (typeof iconValue === 'string' && iconValue.trim() !== '') {
            iconValue = iconValue;
          } else {
            if (categoryName.includes('science')) {
              iconValue = bulbOutline;
            } else if (categoryName.includes('entrepreneur') || categoryName.includes('business')) {
              iconValue = briefcaseOutline;
            } else if (categoryName.includes('history')) {
              iconValue = timeOutline;
            } else if (categoryName.includes('technology') || categoryName.includes('tech')) {
              iconValue = laptopOutline;
            } else if (categoryName.includes('general knowledge') || categoryName.includes('general')) {
              iconValue = cubeOutline;
            } else {
              iconValue = cubeOutline;
            }
          }

          return {
            id: category.id,
            name: category.name || category.category_name || 'Unnamed Category',
            icon: iconValue,
            color: colors[index % colors.length],
            quizzes: category.quizCount || 0
          };
        });
        console.log('Mapped categories:', mappedCategories);
        setCategories(mappedCategories.length > 0 ? mappedCategories : fallbackCategories);
      } else {
        throw new Error('Invalid category data format');
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error('Error fetching categories:', axiosError.response?.data || axiosError.message, axiosError.response?.status);
      const errorMsg = axiosError.response?.data?.message || axiosError.message || 'Failed to load categories';
      setToastMessage(`Error fetching categories: ${errorMsg}`);
      setShowToast(true);
      setCategories(fallbackCategories);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      const token = localStorage.getItem('token');
      console.log('Fetching leaderboard with token:', token);
      const response = await api.get('/api/leaderboard');
      console.log('Leaderboard API response:', response.data);
      if (Array.isArray(response.data)) {
        setLeaderboard(response.data);
      } else {
        throw new Error('Invalid leaderboard data format');
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error('Error fetching leaderboard:', axiosError.response?.data || axiosError.message, axiosError.response?.status);
      const errorMsg = axiosError.response?.data?.message || 'Failed to load leaderboard';
      setToastMessage(`Error: ${errorMsg}`);
      setShowToast(true);
      setLeaderboard([
        { id: 1, name: 'Alex', points: 12350, rank: 1 },
        { id: 2, name: 'Taylor', points: 10980, rank: 2 },
        { id: 3, name: 'Jordan', points: 9870, rank: 3 }
      ]);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleCategoryClick = useCallback((categoryId: number) => {
    history.push(`/tabs/categoryQuiz/${categoryId}`);
  }, [history]);

  const handleSearchChange = useCallback((e: CustomEvent) => {
    const value = e.detail.value || '';
    setSearchText(value);
    if (value.length > 0) {
      setLoading(true);
      setTimeout(() => setLoading(false), 800);
    }
  }, []);

  const handleModeSelect = useCallback((modeId: number) => {
    const mode = quizModes.find(m => m.id === modeId)?.title.toLowerCase() || 'standard';
    console.log('Navigating to confirm mode with mode:', mode);
    history.push(`/tabs/confirmmode?mode=${mode}`);
  }, [history, quizModes]);

  useEffect(() => {
    fetchCategories();
    fetchLeaderboard();
  }, []);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--accent-gold)' }}>
          <div className="flex justify-between items-center" style={{ padding: platformStyles.headerPadding }}>
            <IonButtons>
              <BackButton />
            </IonButtons>
            <div className="text-xl font-bold text-[var(--primary-dark)] flex items-center">
              <IonIcon icon={bulbOutline} className="mr-2 text-2xl" />
              QuizMaster
            </div>
            <IonButtons>
              <IonButton fill="clear" className="text-[var(--primary-dark)]">
                <IonIcon slot="icon-only" icon={flameOutline} />
              </IonButton>
            </IonButtons>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent 
        className="ion-padding-bottom-0" 
        scrollY={true}
        style={{ '--padding-bottom': platformStyles.contentPaddingBottom, zIndex: 10 }}
      >
        <div className="px-4 py-3">
          <IonSearchbar
            value={searchText}
            onIonChange={handleSearchChange}
            placeholder="Search for quizzes"
            className="search-bar mx-0 px-0 py-0 h-12"
            style={{
              '--border-radius': '10px',
              '--background': '#f5f5f5',
              '--color': 'var(--primary-dark)',
              '--placeholder-color': '#8e8e93'
            }}
          />
        </div>

        <div className="px-4 mt-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-[var(--primary-dark)] m-0">Categories</h2>
            <span className="text-[var(--accent-gold)] font-medium text-sm">View All</span>
          </div>

          <div className="flex overflow-x-auto pb-2 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {loading ? (
              <div className="text-center text-gray-500 w-full">
                <IonSpinner name="dots" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center text-gray-500 w-full">
                No categories available
              </div>
            ) : (
              categories.map(category => (
                <div 
                  key={category.id} 
                  className="flex-shrink-0 mr-3 w-20 cursor-pointer" 
                  style={{ scrollSnapAlign: 'start' }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div 
                    className="w-20 h-20 rounded-2xl flex justify-center items-center mb-1" 
                    style={{ backgroundColor: category.color }}
                  >
                    {typeof category.icon === 'string' ? (
                      <span className="text-2xl text-white">{category.icon}</span>
                    ) : (
                      <IonIcon icon={category.icon} className="text-2xl text-white" />
                    )}
                  </div>
                  <div className="text-center w-full">
                    <h3 className="text-sm font-medium mb-0 truncate">{category.name}</h3>
                    <p className="text-xs text-gray-500 m-0">{category.quizzes} quizzes</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="px-4 mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-[var(--primary-dark)] m-0">Quiz Modes</h2>
            <span className="text-[var(--accent-gold)] font-medium text-sm">See More</span>
          </div>

          {quizModes.map(mode => (
            <div 
              key={mode.id} 
              className="mb-3 rounded-xl overflow-hidden"
              style={{
                backgroundColor: 'var(--primary-dark)',
                borderRadius: platformStyles.cardBorderRadius
              }}
            >
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center flex-1">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                      style={{ backgroundColor: mode.color }}
                    >
                      <IonIcon icon={mode.icon} className="text-2xl text-white" />
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{mode.title}</h3>
                      <p className="text-xs text-white opacity-80 m-0 mb-1 truncate">{mode.description}</p>
                      <div className="flex items-center text-xs text-white opacity-80">
                        <span className="flex items-center mr-4">
                          <IonIcon icon={bulbOutline} className="mr-1" />
                          <span>{mode.questions} Questions</span>
                        </span>
                        <span className="flex items-center">
                          <IonIcon icon={trophyOutline} className="mr-1" />
                          <span>{mode.plays} Plays</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <IonButton
                    fill="solid"
                    color="warning"
                    onClick={() => handleModeSelect(mode.id)}
                    className="ml-2"
                  >
                    Play
                  </IonButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 mt-6 mb-20">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-[var(--primary-dark)] m-0">Top Players</h2>
            <span className="text-[var(--accent-gold)] font-medium text-sm">Leaderboard</span>
          </div>

          {loadingLeaderboard ? (
            <div className="text-center text-gray-500 w-full">
              <IonSpinner name="dots" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center text-gray-500 w-full">
              No players on leaderboard yet
            </div>
          ) : (
            leaderboard.map((user) => (
              <div key={user.id} className="mb-2 bg-white rounded-xl shadow-sm">
                <div className="px-4 py-3 flex items-center">
                  <div className="bg-[var(--accent-gold)] rounded-full w-7 h-7 flex items-center justify-center text-[var(--primary-dark)] font-bold flex-shrink-0">
                    {user.rank}
                  </div>
                  <div className="mx-3 flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                      <img src={`/api/placeholder/100/100`} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.points.toLocaleString()} points</div>
                  </div>
                  <div className="flex items-center justify-center flex-shrink-0 ml-2">
                    <IonIcon icon={trophyOutline} className="text-[var(--accent-gold)] mr-1" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </IonContent>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
        color="dark"
      />
    </IonPage>
  );
};

export default Home;