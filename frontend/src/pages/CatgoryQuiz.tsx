import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonBackButton,
  IonContent, 
  IonTitle,
  IonCard,
  IonCardHeader, 
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonChip,
  IonLabel,
  IonSkeletonText,
  IonButton,
  IonToast
} from '@ionic/react';
import { timeOutline, statsChartOutline, star, starOutline } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import api from '../utils/api';
import { AxiosError } from 'axios';

// Interfaces
interface ErrorResponse {
  message: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  image: string;
  questions: number;
  timeMinutes: number;
  difficulty: string;
  rating: number;
  totalRatings: number;
  category: { id: string; name: string; icon: string };
}

interface CategoryInfo {
  color: string;
  textColor: string;
}

interface RouteParams {
  categoryId: string;
}

const CatgoryQuiz: React.FC = () => {
  const { categoryId } = useParams<RouteParams>();
  const history = useHistory();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryName, setCategoryName] = useState<string>('Category Quizzes');
  const [categoryIcon, setCategoryIcon] = useState<string>('❓');
  const [showToast, setShowToast] = useState(false);

  const categoryInfo: { [key: string]: CategoryInfo } = {
    '1': { color: 'bg-purple-600', textColor: 'Science Quizzes' },
    '2': { color: 'bg-blue-400', textColor: 'Geography Quizzes' },
    '3': { color: 'bg-teal-400', textColor: 'Kids Quizzes' },
    '4': { color: 'bg-red-500', textColor: 'Music Quizzes' },
    '5': { color: 'bg-indigo-500', textColor: 'Entrepreneur Quizzes' },
    '11': { color: 'bg-gray-600', textColor: 'General Knowledge Quizzes' },
  };

  useEffect(() => {
    const fetchQuizzes = async () => { 
      try {
        if (!categoryId) {
          console.error('No categoryId provided');
          setCategoryName('Unknown Category');
          setCategoryIcon('❓');
          setLoading(false);
          setShowToast(true);
          return;
        }
        const categoryInfoEntry = categoryInfo[categoryId] || { color: 'bg-gray-500', textColor: 'Unknown Category' };
        if (!categoryInfoEntry) {
          console.warn(`CategoryId ${categoryId} not found in categoryInfo`);
          setCategoryName('Unknown Category');
          setCategoryIcon('❓');
          setLoading(false);
          setShowToast(true);
          return;
        }
        console.log(`Fetching quizzes for categoryId: ${categoryId}`);
        setLoading(true);
        const response = await api.get(`/api/quizzes?category_id=${categoryId}`);
        console.log('Raw quizzes API response:', JSON.stringify(response.data, null, 2));

        let fetchedQuizzes: Quiz[] = [];
        if (Array.isArray(response.data)) {
          fetchedQuizzes = response.data
            .filter((quiz: any) => {
              const categoryIdMatch = quiz.category?.id?.toString() === categoryId.toString();
              console.log(`Quiz ID: ${quiz.id}, category.id: ${quiz.category?.id}, matches: ${categoryIdMatch}`);
              return categoryIdMatch;
            })
            .map((quiz: any) => ({
              id: quiz.id?.toString() || '',
              title: quiz.title || 'Unnamed Quiz',
              description: quiz.description || 'No description available',
              image: quiz.image || 'https://via.placeholder.com/400x200',
              questions: quiz.questions?.length || 0,
              timeMinutes: quiz.timeLimit || 15,
              difficulty: quiz.difficulty || 'Medium',
              rating: quiz.rating || 4.0,
              totalRatings: quiz.totalRatings || 0,
              category: {
                id: quiz.category?.id?.toString() || '',
                name: quiz.category?.name || 'Unknown',
                icon: quiz.category?.icon || '❓',
              },
            }));
        } else if (response.data?.message) {
          console.warn('API message:', response.data.message);
          setShowToast(true);
        } else {
          throw new Error('Invalid quiz data format');
        }

        if (fetchedQuizzes.length === 0) {
          console.warn(`No quizzes found for categoryId: ${categoryId}`);
        }
        const firstQuizCategory = fetchedQuizzes.length > 0 ? fetchedQuizzes[0].category : null;
        setCategoryName(firstQuizCategory?.name || categoryInfoEntry.textColor);
        setCategoryIcon(firstQuizCategory?.icon || '❓');
        setQuizzes(fetchedQuizzes);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error fetching quizzes:', axiosError.response?.data || axiosError.message, axiosError.response?.status);
        setQuizzes([]);
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [categoryId]);

  const renderStars = (rating: number): JSX.Element[] => {
    const stars: JSX.Element[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars.push(<IonIcon key={i} icon={star} className="text-yellow-400" />);
      else if (i === fullStars && hasHalfStar) stars.push(<IonIcon key={i} icon={starOutline} className="text-yellow-400" />);
      else stars.push(<IonIcon key={i} icon={starOutline} className="text-gray-300" />);
    }
    return stars;
  };

  const handleStartQuiz = (quizId: string): void => {
    if (!quizId || quizId === 'undefined') {
      console.error('Invalid quiz ID:', quizId);
      setShowToast(true);
      return;
    }
    history.push(`/tabs/quizdetails/${quizId}`);
    console.log(`Navigating to quiz details with id: ${quizId}`);
  };

  const info = categoryInfo[categoryId] || { color: 'bg-gray-500', textColor: 'Unknown Category' };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--background)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/home" text="Home" />
          </IonButtons>
          <IonTitle className="font-bold" style={{ color: 'var(--text-primary)' }}>{categoryName}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen style={{ '--background': 'var(--background)' }}>
        <div className="p-4">
          <div className="flex items-center mb-6">
            <div className={`${info.color} w-16 h-16 flex items-center justify-center rounded-lg mr-4 shadow-md text-white`}>
              <span className="text-3xl">{categoryIcon}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{categoryName}</h1>
              <p className="text-sm opacity-75" style={{ color: 'var(--text-secondary)' }}>
                {!loading ? `${quizzes.length} quizzes available` : 'Loading quizzes...'}
              </p>
            </div>
          </div>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <IonCard key={`skeleton-${i}`} className="mb-4 rounded-xl overflow-hidden shadow-lg">
                <div className="h-40 w-full"><IonSkeletonText animated style={{ height: '100%', width: '100%' }} /></div>
                <IonCardHeader><IonSkeletonText animated style={{ width: '70%', height: '24px' }} /></IonCardHeader>
                <IonCardContent>
                  <IonSkeletonText animated style={{ width: '90%' }} />
                  <IonSkeletonText animated style={{ width: '40%' }} />
                  <div className="flex justify-between mt-4">
                    <IonSkeletonText animated style={{ width: '30%' }} />
                    <IonSkeletonText animated style={{ width: '30%' }} />
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          ) : quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <IonCard key={quiz.id} className="mb-6 rounded-xl overflow-hidden shadow-lg border border-gray-100">
                <div className={`relative ${info.color} h-48 w-full flex items-center justify-center`}>
                  <span className="text-6xl text-white">{quiz.category.icon}</span>
                </div>
                <div className="absolute top-0 right-0 m-2">
                  <IonChip className="bg-white bg-opacity-90 font-semibold">
                    <IonLabel color="dark">{quiz.difficulty}</IonLabel>
                  </IonChip>
                </div>
                <IonCardHeader>
                  <IonCardTitle className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{quiz.title}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className="mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{quiz.description}</p>
                  <div className="flex justify-between items-center text-sm mb-3">
                    <div className="flex items-center">
                      <IonIcon icon={timeOutline} className="mr-1" style={{ color: 'var(--accent-gold)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{quiz.timeMinutes} mins</span>
                    </div>
                    <div className="flex items-center">
                      <IonIcon icon={statsChartOutline} className="mr-1" style={{ color: 'var(--accent-gold)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{quiz.questions} questions</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="flex mr-1">{renderStars(quiz.rating)}</div>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>({quiz.totalRatings})</span>
                    </div>
                    <IonButton className="custom-gradient-button" onClick={() => handleStartQuiz(quiz.id)}>Start Quiz</IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">😕</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No quizzes found</h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>There are no quizzes available in this category yet.</p>
              <IonButton className="custom-gradient-button" routerLink="/tabs/home">Explore Other Categories</IonButton>
            </div>
          )}
        </div>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={categoryInfo[categoryId] ? "Failed to load quizzes or no quizzes exist for this category." : "Invalid category selected."}
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default CatgoryQuiz;