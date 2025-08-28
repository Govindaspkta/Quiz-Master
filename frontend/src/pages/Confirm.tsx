import React, { useState } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonContent, 
  IonTitle, 
  IonButton, 
  IonIcon,
  IonText
} from '@ionic/react';
import { arrowForward } from 'ionicons/icons';
import { useLocation, useHistory } from 'react-router-dom';
import api from '../utils/api';

interface Quiz {
  id: string;
  title: string;
  timeLimit: number;
  questions: Array<{
    id: string;
    question: string;
    type: string;
    options: Array<{
      id: number;
      option_text: string;
      is_correct: boolean;
    }>;
    answer: string;
    explanation: string;
  }>;
}

const ConfirmMode: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const mode = query.get('mode') || 'standard';
  const categoryId = query.get('category_id');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      console.log('Fetching dynamic quiz with mode:', mode, 'categoryId:', categoryId);
      const response = await api.get(`/api/quizzes/dynamic?mode=${mode}&num_questions=15${categoryId ? `&category_id=${categoryId}` : ''}`);
      console.log('API response:', JSON.stringify(response.data, null, 2));

      if (response.data.message === 'Insufficient questions available') {
        throw new Error('Not enough questions available to start the quiz.');
      }

      const quizData: Quiz = {
        id: response.data.id || 'dynamic',
        title: response.data.title || `Dynamic ${mode.charAt(0).toUpperCase() + mode.slice(1)} Quiz`,
        timeLimit: response.data.timeLimit || (mode === 'rapidfire' ? 10 : mode === 'timefree' ? 0 : 15),
        questions: response.data.questions?.map((q: any) => ({
          id: q.id?.toString() || `temp-${Math.random()}`,
          question: q.question || 'No question available',
          type: q.type || 'multiple_choice',
          options: q.options?.map((opt: any, idx: number) => ({
            id: opt.id || idx + 1,
            option_text: opt.option_text || `Option ${idx + 1}`,
            is_correct: opt.is_correct || false,
          })) || [],
          answer: q.answer || '',
          explanation: q.explanation || 'No explanation available.',
        })) || [],
      };

      if (!quizData.questions || quizData.questions.length === 0) {
        throw new Error('No questions available for this quiz');
      }

      quizData.questions.sort(() => Math.random() - 0.5);
      quizData.questions.forEach(q => {
        if (q.options && q.options.length > 0) {
          q.options.sort(() => Math.random() - 0.5);
        } else {
          console.warn(`Question ${q.id} has no options: ${q.question}`);
        }
      });

      console.log('Quiz data fetched and shuffled:', JSON.stringify(quizData, null, 2));
      history.push(`/tabs/modequizplay/${quizData.id}?mode=${mode}${categoryId ? `&category_id=${categoryId}` : ''}`, {
        quiz: quizData
      });
    } catch (error: any) {
      console.error('Error preparing quiz:', error.message);
      console.error(error.stack);
      setErrorMessage(error.message || 'Failed to load quiz. Please try again or check your connection.');
      history.push(`/tabs/modequizplay/dynamic?mode=${mode}${categoryId ? `&category_id=${categoryId}` : ''}`, {
        quiz: null,
        error: error.message || 'No questions available for this quiz'
      });
    } finally {
      setLoading(false);
    }
  };

  console.log('ConfirmMode rendering with mode:', mode);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'var(--background)' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/home" text="Back" />
          </IonButtons>
          <IonTitle className="font-bold" style={{ color: 'var(--text-primary)' }}>
            Confirm {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>
        {errorMessage ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <IonText color="danger">
              <h2 className="text-2xl font-bold mb-4">Error</h2>
              <p className="mb-6 text-lg">{errorMessage}</p>
            </IonText>
            <IonButton onClick={() => history.push('/tabs/home')}>Back to Home</IonButton>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Are you sure you want to start?
            </h2>
            <p className="mb-6 text-lg" style={{ color: 'var(--text-secondary)' }}>
              This will begin a {mode} quiz with 15 questions {categoryId ? `in the selected category` : 'from all categories'}.
            </p>
            <IonButton 
              className="custom-gradient-button"
              onClick={handleConfirm}
              disabled={loading}
              expand="block"
            >
              {loading ? <IonIcon icon={arrowForward} className="animate-spin" /> : 'Start Quiz'}
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ConfirmMode;