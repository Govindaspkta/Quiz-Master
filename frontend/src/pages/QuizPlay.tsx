import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonButtons,
  IonButton,
  IonIcon,
  IonProgressBar,
  IonTitle,
  IonToast,
  IonSkeletonText,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonSpinner,
  IonAlert
} from '@ionic/react';
import { 
  checkmarkOutline, 
  timeOutline, 
  helpCircleOutline, 
  arrowForward, 
  checkmarkCircle,
  arrowBack
} from 'ionicons/icons';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import api from '../utils/api';
import { AxiosError } from 'axios';

// Interfaces
interface ErrorResponse {
  message: string;
}

interface Category {
  id: string | null;
  name: string;
  icon: string;
}

interface Option {
  id: number;
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  question: string;
  type: string;
  options: Option[];
  answer: string;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  timeLimit: number;
  questions: Question[];
  mode?: string;
  message?: string;
  category: Category; // Added category property
}

interface LocationState {
  quiz?: Quiz;
  error?: string;
}

// Fallback quiz data for testing (optional)
const fallbackQuiz: Quiz = {
  id: 'fallback',
  title: 'Sample Quiz',
  timeLimit: 15,
  questions: [
    {
      id: '1',
      question: 'What is 2 + 2?',
      type: 'multiple_choice',
      options: [
        { id: 1, option_text: '3', is_correct: false },
        { id: 2, option_text: '4', is_correct: true },
        { id: 3, option_text: '5', is_correct: false },
        { id: 4, option_text: '6', is_correct: false },
      ],
      answer: '4',
      explanation: '2 + 2 equals 4.',
    },
  ],
  category: { id: null, name: 'Unknown', icon: '❓' },
};

// Components (unchanged)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <IonSpinner name="crescent" />
  </div>
);

const QuizTimer = React.memo(({ timeLeft, progressPercentage, progressBarColor }: { 
  timeLeft: number, 
  progressPercentage: number, 
  progressBarColor: string 
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return (
    <div className="rounded-xl shadow-md p-4">
      <div className="flex items-center mb-2">
        <IonIcon icon={timeOutline} className="mr-2 text-[var(--primary-dark)]" />
        <IonText className="font-semibold text-[var(--text-primary)]">Time Remaining</IonText>
      </div>
      <IonProgressBar value={progressPercentage} color={progressBarColor} className="h-3 rounded-full mb-2" />
      <div className="text-center font-mono text-xl font-bold">
        {minutes}:{seconds < 10 ? '0' : ''}{seconds}
      </div>
    </div>
  );
});

const QuizOptions = React.memo(({ 
  currentQuestion, 
  selectedAnswer, 
  onSelect 
}: {
  currentQuestion: Question | undefined,
  selectedAnswer: string | undefined,
  onSelect: (questionId: string, answer: string) => void
}) => {
  if (!currentQuestion?.options || currentQuestion.options.length === 0) {
    console.log('No options available for question:', currentQuestion);
    return <p className="text-center py-4">No options available for this question.</p>;
  }
  return (
    <div className="space-y-3 mb-4">
      {currentQuestion.options.map((option, index) => {
        const isSelected = selectedAnswer === option.option_text;
        return (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              isSelected 
                ? 'border-[var(--accent-gold)] bg-[var(--accent-yellow)] bg-opacity-20' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onSelect(currentQuestion.id, option.option_text)}
          >
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                isSelected ? 'bg-[var(--accent-gold)]' : 'bg-gray-200'
              }`}>
                {isSelected && <IonIcon icon={checkmarkOutline} className="text-white text-sm" />}
              </div>
              <div className="flex-grow">{option.option_text}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

const ErrorState = ({ 
  message, 
  onBack 
}: {
  message: string,
  onBack: () => void
}) => (
  <IonPage>
    <IonHeader>
      <IonToolbar style={{ '--background': 'var(--background)' }}>
        <IonButtons slot="start">
          <IonButton onClick={onBack}>
            <IonIcon icon={arrowBack} />
            Back
          </IonButton>
        </IonButtons>
        <IonTitle style={{ color: 'var(--text-primary)' }}>Quiz Play</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Error</h2>
        <p className="mb-6 text-lg" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <IonButton onClick={onBack}>Back to Home</IonButton>
      </div>
    </IonContent>
  </IonPage>
);

const QuizContent = React.memo(({ 
  currentQuestion, 
  currentQuestionIndex, 
  totalQuestions, 
  selectedAnswers, 
  handleAnswerSelect, 
  handleNext, 
  remainingQuestions 
}: {
  currentQuestion: Question | undefined,
  currentQuestionIndex: number,
  totalQuestions: number,
  selectedAnswers: Record<string, string>,
  handleAnswerSelect: (questionId: string, answer: string) => void,
  handleNext: () => void,
  remainingQuestions: number
}) => {
  const [showMissingAlert, setShowMissingAlert] = useState<boolean>(false);

  if (!currentQuestion) {
    return <p className="text-center py-4">No question available at index {currentQuestionIndex + 1}.</p>;
  }

  const isNextDisabled = !selectedAnswers[currentQuestion.id];

  const questionText = currentQuestion.question && currentQuestion.question.trim()
    ? currentQuestion.question
    : `Question ${currentQuestionIndex + 1} (Text Missing)`;

  const isMissingInDatabase = questionText.includes("(Text Missing)");

  useEffect(() => {
    if (isMissingInDatabase) {
      setShowMissingAlert(true);
    }
  }, [isMissingInDatabase]);

  return (
    <>
      <IonCard className="rounded-xl shadow-lg mb-4 overflow-hidden">
        <IonCardHeader className="bg-gradient-to-r from-[var(--primary-dark)] to-[var(--primary-medium)] p-4">
          <div className="flex justify-between items-center mb-2">
            <IonBadge color="light" className="text-sm px-3 py-1 rounded-full">
              Question {currentQuestionIndex + 1}/{totalQuestions}
            </IonBadge>
            <IonBadge color="warning" className="text-sm px-3 py-1 rounded-full">
              {remainingQuestions} remaining
            </IonBadge>
          </div>
          <IonCardTitle className="text-xl font-bold" style={{ color: 'white' }}>
            <div className="flex items-start">
              <IonIcon icon={helpCircleOutline} className="mr-2 mt-1 text-[var(--accent-yellow)]" />
              <div style={{ color: 'white' }}>{questionText}</div>
            </div>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent className="p-4">
          <QuizOptions 
            currentQuestion={currentQuestion}
            selectedAnswer={selectedAnswers[currentQuestion.id]}
            onSelect={handleAnswerSelect}
          />
          <IonButton
            expand="block"
            onClick={handleNext}
            disabled={isNextDisabled}
            className="custom-gradient-button mt-6 transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-center w-full">
              {currentQuestionIndex < totalQuestions - 1 ? (
                <>Next Question <IonIcon icon={arrowForward} slot="end" className="ml-1" /></>
              ) : (
                <>Submit Quiz <IonIcon icon={checkmarkCircle} slot="end" className="ml-1" /></>
              )}
            </div>
          </IonButton>
        </IonCardContent>
      </IonCard>
      <IonAlert
        isOpen={showMissingAlert}
        onDidDismiss={() => setShowMissingAlert(false)}
        header="Missing Question Text"
        message="The text for this question is missing in the database. Please contact support to resolve this issue."
        buttons={['OK']}
        cssClass="custom-alert"
      />
    </>
  );
});

const QuizPlay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const query = new URLSearchParams(location.search);
  const mode = query.get('mode') || 'standard';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<{ show: boolean; message: string }>({ 
    show: !!location.state?.error, 
    message: location.state?.error || ""
  });
  const [progressBarColor, setProgressBarColor] = useState<string>("success");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeLeftRef = useRef<number>(0);
  const hasTimerStarted = useRef<boolean>(false);

  const currentQuestion = useMemo(() => {
    return quiz?.questions[currentQuestionIndex];
  }, [quiz, currentQuestionIndex]);

  const totalQuestions = useMemo(() => {
    return quiz?.questions.length || 0;
  }, [quiz]);

  const remainingQuestions = useMemo(() => {
    return totalQuestions - (currentQuestionIndex + 1);
  }, [totalQuestions, currentQuestionIndex]);

  const progressPercentage = useMemo(() => {
    return totalTime > 0 ? timeLeft / totalTime : 0;
  }, [timeLeft, totalTime]);

  const handleBack = useCallback(() => {
    history.replace('/tabs/home');
  }, [history]);

  const startTimer = useCallback((initialTime: number) => {
    if (hasTimerStarted.current) return;

    hasTimerStarted.current = true;
    timeLeftRef.current = initialTime;
    setTimeLeft(initialTime);
    setTotalTime(initialTime);

    console.log(`[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' })}] Starting timer with ${initialTime} seconds`);

    if (initialTime > 0) {
      timerRef.current = setInterval(() => {
        timeLeftRef.current -= 1;
        console.log(`[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' })}] Time left: ${timeLeftRef.current}`);
        setTimeLeft(timeLeftRef.current);
        if (timeLeftRef.current <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          handleSubmit();
        }
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        console.log(`[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' })}] Fetching quiz with ID: ${id}, mode: ${mode}`);
        const response = await api.get(`/api/quizzes/${id}?mode=${mode}`);
        console.log(`[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' })}] API response:`, JSON.stringify(response.data, null, 2));

        if (response.data.message) {
          throw new Error(response.data.message);
        }

        const quizData: Quiz = {
          id: response.data.id || id,
          title: response.data.title || 'Untitled Quiz',
          timeLimit: response.data.timeLimit || 15,
          questions: response.data.questions && Array.isArray(response.data.questions)
            ? response.data.questions.map((q: any, index: number) => ({
                id: q.id || `q-${index}`,
                question: q.question || `Question ${index + 1} (Text Missing)`,
                type: q.type || 'multiple_choice',
                options: q.options.map((opt: any, optIndex: number) => ({
                  id: opt.id || optIndex + 1,
                  option_text: opt.option_text || `Option ${optIndex + 1}`,
                  is_correct: opt.is_correct || false,
                })),
                answer: q.answer || '',
                explanation: q.explanation || 'No explanation available.',
              }))
            : [],
          mode: response.data.mode || mode,
          message: response.data.message,
          category: response.data.category || { id: null, name: 'Unknown', icon: '❓' },
        };

        if (quizData.questions.length === 0 && !quizData.message) {
          throw new Error('No questions available for this quiz');
        }

        setQuiz(quizData);

        let initialTime = quizData.timeLimit * 60;
        if (mode === 'rapidfire') {
          initialTime = 10 * 60;
        } else if (mode === 'timefree') {
          initialTime = 0;
        }
        startTimer(initialTime);
      } catch (error: any) {
        const axiosError = error as AxiosError<ErrorResponse>;
        let errorMessage = axiosError.response?.data?.message || axiosError.message || 'Failed to load quiz.';
        if (axiosError.response?.status === 403) {
          errorMessage = 'Please log in to access this quiz.';
        }
        console.error(`[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' })}] Error fetching quiz:`, errorMessage);
        setError({ show: true, message: errorMessage });
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      hasTimerStarted.current = false;
    };
  }, [id, mode, startTimer]);

  useEffect(() => {
    if (quiz && totalTime > 0) {
      const percentage = timeLeft / totalTime;
      if (percentage < 0.25) setProgressBarColor("danger");
      else if (percentage < 0.5) setProgressBarColor("warning");
      else setProgressBarColor("success");
    }
  }, [timeLeft, totalTime, quiz]);

  const handleAnswerSelect = useCallback((questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleNext = useCallback(() => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  }, [currentQuestionIndex, quiz]);

  const handleSubmit = useCallback(() => {
    if (!quiz) {
      setError({ show: true, message: 'No quiz data available to submit.' });
      return;
    }
    let correctCount = 0;
    const answersData: { question_id: string; option_id: number | null }[] = [];
    quiz.questions.forEach((question) => {
      const userAnswer = selectedAnswers[question.id];
      const userOption = question.options.find((opt) => opt.option_text === userAnswer);
      const isCorrect = userOption?.is_correct || false;
      if (isCorrect) correctCount++;
      answersData.push({
        question_id: question.id,
        option_id: userOption?.id || null,
      });
    });
    const finalScore = (correctCount / quiz.questions.length) * 100 || 0;
    const timeTaken = mode === 'timefree' ? 0 : totalTime - timeLeft;

    const submitPayload = {
      quiz_id: quiz.id,
      category_id: quiz.category?.id || null,
      answers: answersData,
      time_taken: timeTaken,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      total_questions: quiz.questions.length,
      mode: mode,
    };
    console.log('Submitting payload:', submitPayload);

    api.post('/api/quizzes/submit', submitPayload)
      .then((submitResponse) => {
        console.log('Submit response:', submitResponse.data);
        setScore(finalScore);
        setError({ show: true, message: `Quiz Completed! Your Score: ${finalScore.toFixed(2)}%` });
        setTimeout(() => {
          const state = {
            score: finalScore,
            quizTitle: quiz.title || 'Unnamed Quiz',
            totalQuestions: quiz.questions.length || 0,
            correctAnswers: correctCount || 0,
            timeTaken: timeTaken || 0,
            questions: quiz.questions.map((q) => ({
              id: q.id,
              text: q.question,
              options: q.options.map((opt) => opt.option_text),
              correctAnswer: q.answer,
              explanation: q.explanation || 'No explanation available',
            })),
            mode: mode,
          };
          history.push(`/tabs/quizresult/${quiz.id}`, state);
        }, 1000);
      })
      .catch((error) => {
        const axiosError = error as AxiosError<ErrorResponse>;
        const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Failed to submit quiz.';
        console.error('Submission error:', error);
        setError({ show: true, message: errorMessage });
        setScore(finalScore);
        setTimeout(() => {
          const state = {
            score: finalScore,
            quizTitle: quiz.title || 'Unnamed Quiz',
            totalQuestions: quiz.questions.length || 0,
            correctAnswers: correctCount || 0,
            timeTaken: timeTaken || 0,
            questions: quiz.questions.map((q) => ({
              id: q.id,
              text: q.question,
              options: q.options.map((opt) => opt.option_text),
              correctAnswer: q.answer,
              explanation: q.explanation || 'No explanation available',
            })),
            mode: mode,
          };
          history.push(`/tabs/quizresult/${quiz.id}`, state);
        }, 1000);
      });
  }, [quiz, selectedAnswers, history, timeLeft, totalTime, mode]);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={handleBack}>
                <IonIcon icon={arrowBack} />
                Back
              </IonButton>
            </IonButtons>
            <IonTitle>Quiz Play</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="animate-pulse space-y-4">
            <IonSkeletonText animated style={{ height: '60px', borderRadius: '12px', margin: '16px 0' }} />
            <IonSkeletonText animated style={{ height: '200px', borderRadius: '16px' }} />
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => (
              <IonSkeletonText key={i} animated style={{ height: '50px', borderRadius: '8px' }} />
            ))}</div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!quiz || error.show) {
    return <ErrorState message={error.message || 'Failed to load quiz'} onBack={handleBack} />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-gradient-to-r from-[var(--primary-dark)] to-[var(--primary-medium)]">
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon icon={arrowBack} />
              Back
            </IonButton>
          </IonButtons>
          <IonTitle className="font-bold">
            <div className="truncate">{quiz.title} ({mode.charAt(0).toUpperCase() + mode.slice(1)})</div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding scrollbar-hide" fullscreen>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <QuizTimer 
              timeLeft={timeLeft}
              progressPercentage={progressPercentage}
              progressBarColor={progressBarColor}
            />
          </div>
          <QuizContent
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            selectedAnswers={selectedAnswers}
            handleAnswerSelect={handleAnswerSelect}
            handleNext={handleNext}
            remainingQuestions={remainingQuestions}
          />
          <div className="flex justify-between items-center text-sm text-[var(--text-secondary)] mb-4">
            <span>Progress: {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
            <span>{currentQuestionIndex + 1} of {totalQuestions}</span>
          </div>
          <IonProgressBar 
            value={(currentQuestionIndex + 1) / totalQuestions} 
            color="primary"
            className="h-2 rounded-full mb-8" />
        </div>
      </IonContent>
      <IonToast
        isOpen={error.show}
        onDidDismiss={() => setError({ show: false, message: "" })}
        message={error.message}
        duration={2000}
        icon={score !== null ? checkmarkOutline : undefined}
        color={score !== null ? "success" : "danger"}
        position="top"
        className="mt-4"
      />
    </IonPage>
  );
};

export default QuizPlay;