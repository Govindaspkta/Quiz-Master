import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonIcon,
  IonButton,
  IonButtons,
  IonSpinner,
  isPlatform
} from '@ionic/react';
import { bulbOutline, timeOutline, trophyOutline, arrowBackOutline } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import '../theme/variables.css';
import BackButton from '../components/BackButton';
import api from '../utils/api';
import { AxiosError } from 'axios';

// Interface for error response
interface ErrorResponse {
  message: string;
}

// Interface for quiz data
interface Quiz {
  id: number;
  title: string;
  category: string;
  icon: string | any;
  color: string;
  questions: number;
  plays: number;
}

const CategoryQuiz: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categoryName, setCategoryName] = useState<string>('Category Quizzes');

  // Platform-specific styling adjustments
  const getPlatformStyles = () => {
    return {
      cardBorderRadius: isPlatform('ios') ? '16px' : '12px',
      sectionPadding: isPlatform('ios') ? '16px' : '12px',
      headerPadding: isPlatform('ios') ? '8px 16px' : '8px 12px',
      contentPaddingBottom: isPlatform('ios') ? '80px' : '70px',
    };
  };

  const platformStyles = getPlatformStyles();

  // Fetch quizzes for the category
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/quizzes?category_id=${categoryId}`);
        console.log('Quizzes API response:', response.data);

        if (Array.isArray(response.data.quizzes)) {
          const colors = ['#7209b7', '#f4a261', '#2a9d8f', '#e63946', '#4361ee', '#ff9100', '#00b4d8', '#7cb518'];
          const mappedQuizzes: Quiz[] = response.data.quizzes.map((quiz: any, index: number) => ({
            id: quiz.id,
            title: quiz.title || 'Unnamed Quiz',
            category: quiz.category_name || 'Unknown Category',
            icon: quiz.category_name?.toLowerCase().includes('history') ? timeOutline : bulbOutline, // Simplified icon mapping
            color: colors[index % colors.length],
            questions: quiz.questions?.length || 0,
            plays: quiz.plays || 0,
          }));
          setQuizzes(mappedQuizzes);
          setCategoryName(response.data.category_name || 'Category Quizzes');
        } else {
          throw new Error('Invalid quiz data format');
        }
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error fetching quizzes:', axiosError.response?.data || axiosError.message, axiosError.response?.status);
        // Fallback data
        setQuizzes([
          { id: 1, title: 'Sample Quiz 1', category: 'Sample', icon: bulbOutline, color: '#7209b7', questions: 10, plays: 100 },
          { id: 2, title: 'Sample Quiz 2', category: 'Sample', icon: timeOutline, color: '#f4a261', questions: 15, plays: 200 },
        ]);
        setCategoryName('Sample Category');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [categoryId]);

  // Navigate to quiz details
  const handleQuizClick = (quizId: number) => {
    history.push(`/tabs/quizdetails/${quizId}`);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--accent-gold)' }}>
          <IonButtons slot="start">
            <BackButton />
          </IonButtons>
          <div className="text-xl font-bold text-center text-[var(--primary-dark)]">{categoryName}</div>
        </IonToolbar>
      </IonHeader>

      <IonContent 
        className="ion-padding-bottom-0" 
        scrollY={true}
        style={{ '--padding-bottom': platformStyles.contentPaddingBottom, zIndex: 10 }}
      >
        {/* Quizzes List */}
        <div className="px-4 mt-6">
          {loading ? (
            <div className="text-center text-gray-500 w-full">
              <IonSpinner name="dots" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center text-gray-500 w-full">
              No quizzes available for this category
            </div>
          ) : (
            quizzes.map(quiz => (
              <div 
                key={quiz.id} 
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
                        style={{ backgroundColor: quiz.color }}
                      >
                        <IonIcon icon={quiz.icon} className="text-2xl text-white" />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">{quiz.title}</h3>
                        <div className="flex items-center text-xs text-white opacity-80">
                          <span className="flex items-center mr-4">
                            <IonIcon icon={bulbOutline} className="mr-1" />
                            <span>{quiz.questions} Questions</span>
                          </span>
                          <span className="flex items-center">
                            <IonIcon icon={trophyOutline} className="mr-1" />
                            <span>{quiz.plays} Plays</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <IonButton
                      fill="solid"
                      color="warning"
                      onClick={() => handleQuizClick(quiz.id)}
                      className="ml-2"
                    >
                      Details
                    </IonButton>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CategoryQuiz;