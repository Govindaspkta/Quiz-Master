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
  IonButton, 
  IonSkeletonText, 
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

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  image: string;
  questions: Question[];
  timeLimit: number;
  difficulty: string;
  rating: number;
  totalRatings: number;
  category: { id: string; name: string; icon: string };
}

interface RouteParams {
  quizId: string;
}

const QuizDetails: React.FC = () => {
  const { quizId } = useParams<RouteParams>();
  const history = useHistory();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        if (!quizId || quizId === 'undefined') {
          console.error('No quizId provided');
          setLoading(false);
          setShowToast(true);
          return;
        }
        console.log(`Fetching quiz details for quizId: ${quizId}`);
        setLoading(true);
        const response = await api.get(`/api/quizzes/${quizId}`);
        console.log('Quiz Details API response:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.id) {
          const quizData: Quiz = {
            id: response.data.id?.toString() || '',
            title: response.data.title || 'Unnamed Quiz',
            description: response.data.description || 'No description available',
            image: response.data.image || 'https://via.placeholder.com/400x200',
            questions: (response.data.questions || []).map((q: any) => ({
              id: q.id?.toString() || '',
              text: q.question || 'No question',
              options: Array.isArray(q.options) ? q.options : [],
              correctAnswer: q.answer || '',
            })),
            timeLimit: response.data.timeLimit || 15,
            difficulty: response.data.difficulty || 'Medium',
            rating: response.data.rating || 4.0,
            totalRatings: response.data.totalRatings || 0,
            category: response.data.category || { id: '', name: '', icon: '❓' },
          };
          setQuiz(quizData);
        } else {
          throw new Error('Invalid quiz data format');
        }
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error fetching quiz details:', axiosError.response?.data || axiosError.message, axiosError.response?.status);
        setQuiz(null);
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

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

  const handlePlayQuiz = () => {
    if (!quiz || !quiz.id) {
      console.error('No quiz data to start');
      setShowToast(true);
      return;
    }
    console.log(`Starting quiz with id: ${quiz.id} and data:`, JSON.stringify(quiz, null, 2));
    history.push({
      pathname: `/tabs/quizplay/${quiz.id}`,
      state: { quiz }
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--background)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/tabs/categoryQuiz/${quiz?.category?.id || ''}`} text="Back" />
          </IonButtons>
          <IonTitle className="font-bold" style={{ color: 'var(--text-primary)' }}>
            {quiz?.title || 'Quiz Details'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen style={{ '--background': 'var(--background)' }} className="ion-padding">
        {loading ? (
          <IonCard className="rounded-xl overflow-hidden shadow-lg">
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
        ) : quiz ? (
          <IonCard className="rounded-xl overflow-hidden shadow-lg border border-gray-100">
            <div className={`relative ${quiz.category.id ? 'bg-indigo-500' : 'bg-gray-500'} h-48 w-full flex items-center justify-center`}>
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
                  <span style={{ color: 'var(--text-secondary)' }}>{quiz.timeLimit} mins</span>
                </div>
                <div className="flex items-center">
                  <IonIcon icon={statsChartOutline} className="mr-1" style={{ color: 'var(--accent-gold)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{quiz.questions.length} questions</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="flex mr-1">{renderStars(quiz.rating)}</div>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>({quiz.totalRatings})</span>
                </div>
                <IonButton className="custom-gradient-button" onClick={handlePlayQuiz}>Play Now</IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        ) : (
          <div className="ion-text-center ion-padding py-16">
            <div className="text-5xl mb-4">😕</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No quiz found</h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>This quiz is not available.</p>
            <IonButton className="custom-gradient-button" routerLink="/tabs/home">Back to Home</IonButton>
          </div>
        )}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Failed to load quiz details."
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default QuizDetails;