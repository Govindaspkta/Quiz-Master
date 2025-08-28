import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonButtons,
  IonBackButton,
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
  IonSpinner
} from '@ionic/react';
import { 
  checkmarkOutline, 
  timeOutline, 
  helpCircleOutline, 
  arrowForward, 
  checkmarkCircle 
} from 'ionicons/icons';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import api from '../utils/api';
import { AxiosError } from 'axios';
import BackButton from '../components/BackButton';

// Interfaces
interface ErrorResponse {
  message: string;
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
  timeLimit?: number;
  questions: Question[];
  mode?: string;
  category_id?: string; // Added to support category quizzes
}

interface LocationState {
  quiz?: Quiz;
  error?: string;
}

// Fallback quiz data for testing
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
    {
      id: '2',
      question: 'What is the capital of France?',
      type: 'multiple_choice',
      options: [
        { id: 1, option_text: 'London', is_correct: false },
        { id: 2, option_text: 'Paris', is_correct: true },
        { id: 3, option_text: 'Berlin', is_correct: false },
        { id: 4, option_text: 'Madrid', is_correct: false },
      ],
      answer: 'Paris',
      explanation: 'The capital of France is Paris.',
    },
  ],
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <IonSpinner name="crescent" />
  </div>
);

// Quiz Timer Component
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

// Quiz Options Component
const QuizOptions = React.memo(({ 
  currentQuestion, 
  selectedAnswer, 
  onSelect, 
  startTimer,
  getInitialTime
}: {
  currentQuestion: Question | undefined,
  selectedAnswer: string | undefined,
  onSelect: (questionId: string, answer: string) => void,
  startTimer: (initialTime: number) => void,
  getInitialTime: () => number
}) => {
  if (!currentQuestion?.options || currentQuestion.options.length === 0) {
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
            onClick={() => {
              console.log(`Option clicked: ${option.option_text} for question ${currentQuestion.id}`);
              onSelect(currentQuestion.id, option.option_text);
              if (!isSelected) startTimer(getInitialTime());
            }}
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

// Error State Component
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
          <IonBackButton defaultHref="/tabs/home" />
        </IonButtons>
        <IonTitle style={{ color: 'var(--text-primary)' }}>Mode Quiz Play</IonTitle>
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

// Quiz Content Component
const QuizContent = React.memo(({ 
  currentQuestion, 
  currentQuestionIndex, 
  totalQuestions, 
  selectedAnswers, 
  handleAnswerSelect, 
  handleNext, 
  remainingQuestions,
  startTimer,
  getInitialTime
}: {
  currentQuestion: Question | undefined,
  currentQuestionIndex: number,
  totalQuestions: number,
  selectedAnswers: Record<string, string>,
  handleAnswerSelect: (questionId: string, answer: string) => void,
  handleNext: () => void,
  remainingQuestions: number,
  startTimer: (initialTime: number) => void,
  getInitialTime: () => number
}) => {
  if (!currentQuestion) {
    return <p className="text-center py-4">No question available.</p>;
  }

  const isNextDisabled = !selectedAnswers[currentQuestion.id];
  console.log(`Next button disabled: ${isNextDisabled}, selected answer for question ${currentQuestion.id}: ${selectedAnswers[currentQuestion.id]}`);

  return (
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
            <div>{currentQuestion.question}</div>
          </div>
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent className="p-4">
        <QuizOptions 
          currentQuestion={currentQuestion}
          selectedAnswer={selectedAnswers[currentQuestion.id]}
          onSelect={handleAnswerSelect}
          startTimer={startTimer}
          getInitialTime={getInitialTime}
        />
        <IonButton
          expand="block"
          onClick={() => {
            console.log('Next button clicked');
            handleNext();
            if (currentQuestionIndex === 0) startTimer(getInitialTime());
          }}
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
  );
});

const ModeQuizPlay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const query = new URLSearchParams(location.search);
  const mode = query.get('mode') || 'standard';
  const categoryId = query.get('category_id') || '';

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
  const [isTimerStarted, setIsTimerStarted] = useState<boolean>(false);

  // Use refs to manage timer state
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeLeftRef = useRef<number>(0);
  const hasTimerStarted = useRef<boolean>(false);

  // Cap total questions at 10 for this mode
  const MAX_QUESTIONS = 10;

  const currentQuestion = useMemo(() => {
    const question = quiz?.questions[currentQuestionIndex];
    console.log('Current question at index', currentQuestionIndex, ':', question);
    return question;
  }, [quiz, currentQuestionIndex]);

  const totalQuestions = useMemo(() => {
    const count = Math.min(quiz?.questions.length || 0, MAX_QUESTIONS);
    console.log('Total questions (capped at 10):', count);
    return count;
  }, [quiz]);

  const remainingQuestions = useMemo(() => {
    const remaining = totalQuestions - (currentQuestionIndex + 1);
    console.log('Remaining questions:', remaining);
    return remaining;
  }, [totalQuestions, currentQuestionIndex]);

  const progressPercentage = useMemo(() => {
    const percentage = totalTime > 0 ? timeLeft / totalTime : 0;
    console.log('Progress percentage:', percentage);
    return percentage;
  }, [timeLeft, totalTime]);

  // Function to get initial time based on mode
  const getInitialTime = useCallback(() => {
    if (mode === 'rapidfire') return 60;
    if (mode === 'timefree') return 0;
    const timeLimitInMinutes = quiz?.timeLimit ?? 15;
    return timeLimitInMinutes * 60;
  }, [mode, quiz]);

  // Function to start the timer
  const startTimer = useCallback((initialTime: number) => {
    if (hasTimerStarted.current || initialTime <= 0 || isTimerStarted || !quiz) return;

    hasTimerStarted.current = true;
    setIsTimerStarted(true);
    timeLeftRef.current = initialTime;
    setTimeLeft(initialTime);
    setTotalTime(initialTime);

    console.log(`[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' })}] Starting timer with ${initialTime} seconds`);

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      console.log(`[${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' })}] Time left: ${timeLeftRef.current}`);
      if (timeLeftRef.current <= 0 && quiz) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        handleSubmit(); // Auto-submit and redirect on time expiry
      }
    }, 1000);
  }, [isTimerStarted, quiz]);

  // Fetch quiz data
  useEffect(() => {
    const fetchDynamicQuiz = async () => {
      setLoading(true);
      try {
        if (location.state?.quiz) {
          console.log('Using quiz from location.state:', JSON.stringify(location.state.quiz, null, 2));
          setQuiz(location.state.quiz);
        } else {
          console.log('Fetching dynamic quiz with mode:', mode, 'and category_id:', categoryId);
          const response = await api.get(`/api/quizzes/dynamic?mode=${mode}&num_questions=15${categoryId ? `&category_id=${categoryId}` : ''}`, {
            validateStatus: (status) => status < 500,
          });
          console.log('Fetched dynamic quiz response:', JSON.stringify(response.data, null, 2));

          if (!response.data || (response.status !== 200 && !response.data.questions)) {
            throw new Error('No valid quiz data returned from API.');
          }

          if (response.data.message === 'Insufficient questions available') {
            console.log('Insufficient questions, using fallback quiz');
            setQuiz(fallbackQuiz);
            return;
          }

          const quizData: Quiz = {
            id: response.data.id || 'dynamic',
            title: response.data.title || 'Dynamic Quiz',
            timeLimit: response.data.timeLimit ?? 15,
            questions: response.data.questions && Array.isArray(response.data.questions)
              ? response.data.questions.map((q: any, index: number) => {
                  const question: Question = {
                    id: q.id?.toString() || `q-${index}`,
                    question: q.question || 'No question text',
                    type: q.type || 'multiple_choice',
                    options: Array.isArray(q.options)
                      ? q.options.map((opt: any, optIndex: number) => ({
                          id: opt.id || optIndex + 1,
                          option_text: opt.option_text || `Option ${optIndex + 1}`,
                          is_correct: opt.is_correct || false,
                        }))
                      : [],
                    answer: q.answer || '',
                    explanation: q.explanation || 'No explanation available.',
                  };
                  console.log('Mapped question:', question);
                  return question;
                })
              : [],
            mode: response.data.mode || mode,
            category_id: categoryId || undefined,
          };

          if (quizData.questions.length === 0) {
            console.log('No questions available, using fallback quiz');
            setQuiz(fallbackQuiz);
            return;
          }

          console.log('Setting quiz data:', JSON.stringify(quizData, null, 2));
          setQuiz(quizData);
        }
      } catch (error: any) {
        const axiosError = error as AxiosError<ErrorResponse>;
        let errorMessage = axiosError.response?.data?.message || axiosError.message || 'Failed to load quiz.';
        if (axiosError.response?.status === 403) {
          errorMessage = 'Please log in to access this quiz.';
        }
        console.error('Error fetching dynamic quiz:', errorMessage, axiosError.response?.status);
        setError({ show: true, message: errorMessage });
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicQuiz();

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      hasTimerStarted.current = false;
      setIsTimerStarted(false);
    };
  }, [mode, categoryId, location.state?.quiz]);

  // Update progress bar color
  useEffect(() => {
    if (quiz && totalTime > 0) {
      const percentage = timeLeft / totalTime;
      if (percentage < 0.25) setProgressBarColor("danger");
      else if (percentage < 0.5) setProgressBarColor("warning");
      else setProgressBarColor("success");
    }
  }, [timeLeft, totalTime, quiz]);

  const handleAnswerSelect = useCallback((questionId: string, answer: string) => {
    console.log(`Answer selected: ${answer} for question ${questionId}`);
    setSelectedAnswers((prev) => {
      const updated = { ...prev, [questionId]: answer };
      console.log('Updated selected answers:', updated);
      return updated;
    });
  }, []);

  const handleNext = useCallback(() => {
    console.log('Handling next question');
    if (!quiz) return;
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => {
        console.log('Moving to question index:', prev + 1);
        return prev + 1;
      });
    } else {
      handleSubmit();
    }
  }, [currentQuestionIndex, quiz, totalQuestions]);

  const handleSubmit = useCallback(async () => {
    if (!quiz || loading) {
      setError({ show: true, message: 'No quiz data available to submit. Please try again or contact support.' });
      console.log('Quiz is null or loading during submission attempt');
      return;
    }

    console.log('Submitting quiz:', { quizId: quiz.id, currentQuestionIndex, selectedAnswers });

    const questionsToProcess = quiz.questions.slice(0, Math.min(currentQuestionIndex + 1, MAX_QUESTIONS));
    let correctCount = 0;
    const answersData: { question_id: string; option_id: number | null }[] = [];
    const answerIndices: number[] = [];
    const userAnswers: string[] = [];
    const correctAnswerTexts: string[] = [];
    const isCorrectArray: boolean[] = [];

    questionsToProcess.forEach((question) => {
      const userAnswer = selectedAnswers[question.id] || '';
      const userOption = question.options.find(opt => opt.option_text === userAnswer);
      const correctOption = question.options.find(opt => opt.is_correct);
      const isCorrect = userOption?.is_correct || false;
      if (isCorrect) correctCount++;
      const userAnswerIndex = userOption ? question.options.findIndex(opt => opt.option_text === userAnswer) : -1;
      answersData.push({
        question_id: question.id,
        option_id: userOption?.id || null
      });
      answerIndices.push(userAnswerIndex);
      userAnswers.push(userAnswer);
      correctAnswerTexts.push(correctOption?.option_text || '');
      isCorrectArray.push(isCorrect);
    });

    const finalScore = (correctCount / questionsToProcess.length) * 100 || 0;
    const timeTaken = mode === 'timefree' ? 0 : totalTime - timeLeft;

    const payload = {
      quiz_id: quiz.id === 'dynamic' ? null : quiz.id, // Use null for dynamic quizzes if QuizHistory expects it
      category_id: quiz.category_id || null,
      answers: answersData,
      time_taken: timeTaken,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      total_questions: questionsToProcess.length,
      mode: mode,
    };
    console.log(`Sending payload to /api/quizzes/submit:`, payload);

    try {
      const response = await api.post('/api/quizzes/submit', payload); // Single endpoint for all quizzes
      console.log('Submit success:', response.data);
      setScore(finalScore);
      setError({ show: true, message: `Quiz Completed! Your Score: ${finalScore.toFixed(2)}%` });
    } catch (error: any) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to submit quiz. Progress saved locally. Please try again or contact support.';
      console.error('Error submitting quiz answers:', errorMessage, axiosError);
      setError({ show: true, message: errorMessage });
      localStorage.setItem(`quizProgress_${quiz.id}`, JSON.stringify({
        answers: selectedAnswers,
        timeTaken,
        currentQuestionIndex,
        mode,
        category_id: quiz.category_id,
      }));
      // Proceed to result page even on error with local data
      setTimeout(() => redirectToResult(finalScore, questionsToProcess, correctCount, timeTaken), 1000);
      return;
    }

    setTimeout(() => redirectToResult(finalScore, questionsToProcess, correctCount, timeTaken), 1000);
  }, [quiz, loading, selectedAnswers, history, timeLeft, totalTime, mode, currentQuestionIndex]);

  const redirectToResult = (finalScore: number, questionsToProcess: Question[], correctCount: number, timeTaken: number) => {
    const state = {
      score: finalScore,
      quizTitle: quiz?.title || 'Unnamed Quiz',
      totalQuestions: questionsToProcess.length,
      correctAnswers: correctCount,
      answers: [],
      userAnswers: Object.values(selectedAnswers).slice(0, questionsToProcess.length),
      correctAnswerTexts: questionsToProcess.map(q => q.answer),
      isCorrect: questionsToProcess.map(q => !!selectedAnswers[q.id] && q.options.find(opt => opt.option_text === selectedAnswers[q.id])?.is_correct || false),
      timeTaken: timeTaken,
      questions: questionsToProcess.map(q => ({
        id: q.id || `temp-${Math.random()}`,
        text: q.question || 'No question text',
        options: q.options?.map(opt => opt.option_text) || [],
        correctAnswer: q.answer || '',
        explanation: q.explanation || 'No explanation available'
      })),
      averageScore: correctCount,
      mode: mode || 'standard'
    };
    console.log('Redirecting to QuizResult with state:', state);
    history.push(`/tabs/quizresult/${quiz?.id || 'dynamic'}`, state);
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tabs/home" />
            </IonButtons>
            <IonTitle>Mode Quiz Play</IonTitle>
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
    return <ErrorState message={error.message || 'Failed to load quiz'} onBack={() => history.push('/tabs/home')} />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-gradient-to-r from-[var(--primary-dark)] to-[var(--primary-medium)]">
          <BackButton />
          <IonTitle className="font-bold">
            <div className="truncate">{quiz.title} ({mode.charAt(0).toUpperCase() + mode.slice(1)})</div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding scrollbar-hide" fullscreen>
        <div className="max-w-3xl mx-auto">
          {mode !== 'timefree' && timeLeft > 0 && isTimerStarted && (
            <div className="mb-6">
              <QuizTimer 
                timeLeft={timeLeft}
                progressPercentage={progressPercentage}
                progressBarColor={progressBarColor}
              />
            </div>
          )}
          <QuizContent
            currentQuestion={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            selectedAnswers={selectedAnswers}
            handleAnswerSelect={handleAnswerSelect}
            handleNext={handleNext}
            remainingQuestions={remainingQuestions}
            startTimer={startTimer}
            getInitialTime={getInitialTime}
          />
          <div className="flex justify-between items-center text-sm text-[var(--text-secondary)] mb-4">
            <span>Progress: {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%</span>
            <span>{currentQuestionIndex + 1} of {totalQuestions}</span>
          </div>
          <IonProgressBar 
            value={(currentQuestionIndex + 1) / totalQuestions} 
            color="primary"
            className="h-2 rounded-full mb-8"
          />
        </div>
      </IonContent>
      <IonToast
        isOpen={error.show && score !== null}
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

export default ModeQuizPlay;