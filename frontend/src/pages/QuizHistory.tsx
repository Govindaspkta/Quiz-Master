import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonToast,
  RefresherEventDetail,
} from '@ionic/react';
import {
  timeOutline,
  calendarOutline,
  statsChartOutline,
  arrowForwardOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import api from '../utils/api';
import '../theme/variables.css';

// Interface for history item
interface HistoryItem {
  id: number;
  quizId: string;
  title: string;
  category: string;
  color: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  completed: boolean;
}

const QuizHistory: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string>('');
  const historyNavigation = useHistory();

  // Fetch history data from backend
  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/history');
      console.log('Fetched history data:', response.data);
      if (response.data.message === 'No quiz history found') {
        setHistory([]);
      } else {
        setHistory(response.data);
      }
      setError('');
    } catch (error: any) {
      console.error('Error fetching history:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load quiz history';
      setError(errorMessage);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    fetchHistoryData().then(() => event.detail.complete());
  };

  const navigateToQuizDetails = (quizId: string) => {
    if (quizId === 'dynamic') {
      // Redirect to dynamic quiz start page
      historyNavigation.push('/tabs/quizzes/dynamic');
    } else {
      historyNavigation.push(`/tabs/quiz-details/${quizId}`);
    }
  };

  const navigateToQuizResults = (historyId: number, quizId: string) => {
    historyNavigation.push(`/tabs/quiz-result/${quizId}?historyId=${historyId}`);
  };

  const goBack = () => {
    historyNavigation.goBack();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#e4b522' }}>
          <IonButtons slot="start">
            <button onClick={goBack} className="flex items-center text-black pl-2">
              <IonIcon icon={arrowBackOutline} className="text-xl mr-1" />
              <span className="text-base">Back</span>
            </button>
          </IonButtons>
          <div className="absolute left-0 right-0 text-xl m-10 font-bold text-center text-black">
            Quiz History
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="pb-4">
          {loading ? (
            <div className="space-y-4 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                  <IonSkeletonText animated style={{ width: '40%', height: '24px' }} />
                  <div className="flex mt-2">
                    <IonSkeletonText animated style={{ width: '25%', height: '16px' }} />
                    <IonSkeletonText animated style={{ width: '35%', height: '16px', marginLeft: '16px' }} />
                  </div>
                  <div className="flex justify-between mt-3">
                    <IonSkeletonText animated style={{ width: '30%', height: '24px' }} />
                    <IonSkeletonText animated style={{ width: '15%', height: '24px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 p-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <IonIcon icon={statsChartOutline} className="text-4xl text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-black">No quiz history</h3>
              <p className="text-sm text-gray-500 text-center mt-2">
                You haven't taken any quizzes yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="mx-4 mb-4 rounded-lg overflow-hidden shadow-sm border border-gray-100"
                >
                  <div className="h-2" style={{ backgroundColor: item.color || '#666666' }}></div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-bold text-black">{item.title}</h3>
                      <div
                        className="px-3 py-1 rounded-md text-white text-xs font-medium"
                        style={{ backgroundColor: '#0a4d8c' }}
                      >
                        {item.category}
                      </div>
                    </div>
                    <div className="flex items-center mb-3 text-sm text-gray-500">
                      <div className="flex items-center mr-4">
                        <IonIcon icon={calendarOutline} className="mr-1 text-gray-400" />
                        <span>{formatDate(item.date).replace(',', '')}</span>
                      </div>
                      <div className="flex items-center">
                        <IonIcon icon={timeOutline} className="mr-1 text-gray-400" />
                        <span>{formatTime(item.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {item.completed ? (
                        <div>
                          <div className="text-xl font-bold text-black">
                            {item.score}/100
                          </div>
                          <div className="text-sm text-gray-500">{item.timeTaken} min</div>
                        </div>
                      ) : (
                        <div className="text-lg font-medium text-orange-500">Incomplete</div>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigateToQuizDetails(item.quizId)}
                          className="bg-gray-100 px-4 py-2 rounded-full text-sm text-black font-medium"
                        >
                          Retry
                        </button>
                        {item.completed && (
                          <button
                            onClick={() => navigateToQuizResults(item.id, item.quizId)}
                            className="bg-[#e4b522] px-4 py-2 rounded-full text-sm text-black font-medium flex items-center"
                          >
                            View <IonIcon icon={arrowForwardOutline} className="ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <IonToast
          isOpen={!!error}
          onDidDismiss={() => setError('')}
          message={error}
          duration={3000}
          position="top"
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default QuizHistory;