import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonIcon,
  IonButton,
  IonButtons,
  IonTitle,
  useIonRouter,
  isPlatform
} from '@ionic/react';
import { 
  trophyOutline, 
  homeOutline,
  shareOutline,
  statsChartOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  ribbonOutline,
  starOutline,
  medalOutline,
  sparklesOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { useParams, useLocation } from 'react-router-dom';
import '../theme/variables.css';

// Interface for location state
interface LocationState {
  score: number;
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  answers: number[];
  timeTaken: number;
  questions: Array<{
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>;
  averageScore: number;
  mode?: string;
  source: 'mode' | 'category';
  quizId?: string;
}

// Platform-specific styling adjustments
const getPlatformStyles = () => {
  return isPlatform('ios') ? {
    cardBorderRadius: '20px',
    sectionPadding: '20px',
    headerPadding: '12px 20px'
  } : {
    cardBorderRadius: '16px',
    sectionPadding: '16px',
    headerPadding: '10px 16px'
  };
};

const QuizResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation<LocationState>();
  const router = useIonRouter();
  const platformStyles = getPlatformStyles();
  const [showCelebration, setShowCelebration] = useState(false);
  
  const {
    score = 0,
    quizTitle = 'Unnamed Quiz',
    totalQuestions = 0,
    correctAnswers = 0,
    answers = [],
    timeTaken = 0,
    questions = [],
    averageScore = 0,
    mode = 'standard',
    source = 'category',
    quizId = id
  } = location.state || {};

  const percentage = score || (totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  const goBack = () => {
    router.goBack();
  };
  
  const goToHome = () => {
    router.push('/tabs/home', 'root', 'replace');
  };
  
  const shareResults = async () => {
    const shareText = `I just completed the "${quizTitle}" quiz and scored ${percentage}%! Check it out!`;
    const shareUrl = window.location.href; // Or replace with a specific shareable link if available (e.g., a deep link or quiz URL)

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Quiz Results',
          text: shareText,
          url: shareUrl,
        });
        console.log('Results shared successfully');
      } catch (error) {
        console.error('Error sharing results:', error);
      }
    } else {
      // Fallback for platforms without Web Share API (e.g., copy to clipboard or alert)
      alert(`Share this: ${shareText} ${shareUrl}`);
      console.log('Web Share API not supported, using fallback');
    }
  };
  
  const getFeedback = () => {
    if (percentage >= 90) {
      return "🎉 Exceptional! You've mastered this topic brilliantly!";
    } else if (percentage >= 75) {
      return "⭐ Great job! You have a strong understanding of this subject!";
    } else if (percentage >= 50) {
      return "👍 Good effort! You've got a solid foundation, but there's room to improve.";
    } else {
      return "💪 Nice try! This topic might need a bit more study, but you're on your way!";
    }
  };
  
  const compareToAverage = () => {
    const averagePercentage = totalQuestions > 0 ? Math.round((averageScore / totalQuestions) * 100) : 0;
    if (correctAnswers > averageScore) {
      return `🚀 Outstanding! You scored ${percentage - averagePercentage}% above average!`;
    } else if (correctAnswers === averageScore) {
      return `📊 You scored exactly the average of ${averagePercentage}%.`;
    } else {
      return `📈 The average score is ${averagePercentage}%. Keep pushing forward!`;
    }
  };

  const getPerformanceData = () => {
    if (percentage >= 90) return { 
      icon: sparklesOutline, 
      bgGradient: 'linear-gradient(135deg, var(--accent-gold), var(--accent-yellow))',
      textColor: 'var(--primary-dark)',
      bgClass: 'performance-excellent',
      borderColor: 'var(--accent-gold)',
      shadowColor: 'rgba(240, 203, 70, 0.5)'
    };
    if (percentage >= 75) return { 
      icon: starOutline, 
      bgGradient: 'linear-gradient(135deg, #d4af37, var(--accent-gold))',
      textColor: 'var(--primary-dark)',
      bgClass: 'performance-good',
      borderColor: 'var(--accent-gold)',
      shadowColor: 'rgba(212, 175, 55, 0.5)'
    };
    if (percentage >= 50) return { 
      icon: trophyOutline, 
      bgGradient: 'linear-gradient(135deg, #b8860b, var(--accent-gold))',
      textColor: 'var(--primary-dark)',
      bgClass: 'performance-average',
      borderColor: '#b8860b',
      shadowColor: 'rgba(184, 134, 11, 0.5)'
    };
    return { 
      icon: medalOutline, 
      bgGradient: 'linear-gradient(135deg, #cd7f32, #daa520)',
      textColor: 'var(--primary-dark)',
      bgClass: 'performance-needs-improvement',
      borderColor: '#cd7f32',
      shadowColor: 'rgba(205, 127, 50, 0.5)'
    };
  };

  const performanceData = getPerformanceData();
  
  useEffect(() => {
    console.log('QuizResult state:', JSON.stringify(location.state, null, 2));
    if (!location.state) {
      console.warn('No state passed to QuizResult, using defaults.');
    }
    
    // Trigger celebration animation for high scores
    if (percentage >= 75) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [location.state, percentage]);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ background: 'linear-gradient(90deg, var(--accent-gold), var(--accent-yellow))' }}>
          <IonButtons slot="start">
            <IonButton onClick={goBack} fill="clear">
              <IonIcon icon={arrowBackOutline} style={{ color: 'var(--primary-dark)', fontSize: '24px' }} />
            </IonButton>
          </IonButtons>
          <IonTitle style={{ color: 'var(--primary-dark)', fontWeight: 'bold', fontSize: '18px', textShadow: '0 0 1px rgba(0, 0, 0, 0.3)' }}>
            Quiz Results
          </IonTitle>
          <div className="absolute inset-0 bg-white/10 rounded-b-3xl pointer-events-none" style={{ zIndex: -1 }}></div>
        </IonToolbar>
      </IonHeader>
      
      <IonContent style={{ background: 'var(--background)' }}>
        {/* Celebration Animation */}
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
            <div className="animate-bounce text-6xl">🎉</div>
          </div>
        )}

        <div className="px-4 py-6 max-w-4xl mx-auto">
          {/* Hero Score Section */}
          <div className="relative overflow-hidden mb-8">
            <div 
              className="rounded-3xl shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
              style={{ 
                background: performanceData.bgGradient,
                boxShadow: `0 25px 50px -12px ${performanceData.shadowColor}`
              }}
            >
              {/* Animated Background Patterns */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 animate-pulse"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12 animate-pulse delay-300"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 translate-y-10 animate-pulse delay-700"></div>
                <div className="absolute bottom-0 right-0 w-28 h-28 bg-white rounded-full translate-x-14 translate-y-14 animate-pulse delay-500"></div>
              </div>
              
              <div className="relative p-8 text-center">
                <div className="flex items-center justify-center mb-4">
                  <IonIcon icon={performanceData.icon} className="text-4xl mr-3 animate-pulse" style={{ color: performanceData.textColor }} />
                  <h2 className="text-2xl font-bold truncate max-w-xs" style={{ color: performanceData.textColor }}>
                    {quizTitle}
                  </h2>
                </div>
                
                {/* Animated Score Circle */}
                <div className="flex justify-center mb-6">
                  <div 
                    className="relative w-40 h-40 rounded-full shadow-2xl backdrop-blur-sm border-4"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderColor: performanceData.borderColor
                    }}
                  >
                    <div className="absolute inset-4 rounded-full bg-white/20 backdrop-blur-md"></div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="relative flex items-center justify-center h-full">
                      <div className="text-center z-10">
                        <div className="text-5xl font-black drop-shadow-lg" style={{ color: performanceData.textColor }}>
                          {percentage}%
                        </div>
                        <div className="text-sm opacity-90 font-semibold" style={{ color: performanceData.textColor }}>
                          {correctAnswers} of {totalQuestions}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-lg font-medium mb-6 px-4 leading-relaxed" style={{ color: performanceData.textColor }}>
                  {getFeedback()}
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg transform hover:scale-105 transition-all duration-200">
                    <IonIcon icon={checkmarkCircleOutline} className="text-3xl mx-auto mb-2 drop-shadow-lg" style={{ color: '#22c55e' }} />
                    <div className="opacity-90 text-sm font-medium" style={{ color: performanceData.textColor }}>Correct</div>
                    <div className="font-black text-2xl drop-shadow-lg" style={{ color: '#22c55e' }}>{correctAnswers}</div>
                  </div>
                  
                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg transform hover:scale-105 transition-all duration-200">
                    <IonIcon icon={closeCircleOutline} className="text-3xl mx-auto mb-2 drop-shadow-lg" style={{ color: '#ef4444' }} />
                    <div className="opacity-90 text-sm font-medium" style={{ color: performanceData.textColor }}>Incorrect</div>
                    <div className="font-black text-2xl drop-shadow-lg" style={{ color: '#ef4444' }}>{totalQuestions - correctAnswers}</div>
                  </div>
                  
                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg transform hover:scale-105 transition-all duration-200">
                    <IonIcon icon={timeOutline} className="text-3xl mx-auto mb-2 drop-shadow-lg" style={{ color: 'var(--accent-gold)' }} />
                    <div className="opacity-90 text-sm font-medium" style={{ color: performanceData.textColor }}>Time</div>
                    <div className="font-black text-2xl drop-shadow-lg" style={{ color: 'var(--accent-gold)' }}>{formatTime(timeTaken)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance Analysis */}
          <div 
            className="backdrop-blur-md p-6 rounded-2xl mb-8 shadow-xl border transform hover:scale-[1.01] transition-all duration-300"
            style={{ 
              background: 'linear-gradient(135deg, rgba(204, 160, 0, 0.1), rgba(240, 203, 70, 0.1))',
              borderColor: 'var(--accent-gold)',
              boxShadow: '0 10px 25px rgba(204, 160, 0, 0.2)'
            }}
          >
            <div className="flex items-start">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mr-4 shadow-lg transform hover:rotate-3 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-yellow))' }}
              >
                <IonIcon icon={statsChartOutline} className="text-2xl" style={{ color: 'var(--primary-dark)' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-2 text-xl" style={{ color: 'var(--text-primary)' }}>Performance Insight</h3>
                <p className="leading-relaxed text-lg" style={{ color: 'var(--text-secondary)' }}>{compareToAverage()}</p>
              </div>
            </div>
          </div>
          
          {/* Question Review */}
          {questions.length > 0 ? (
            <>
              <div className="flex items-center mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-yellow))' }}
                >
                  <IonIcon icon={ribbonOutline} className="text-xl" style={{ color: 'var(--primary-dark)' }} />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Question Review</h2>
              </div>
              
              <div className="space-y-6 mb-32">
                {questions.map((question, index) => {
                  const userAnswer = answers[index] !== undefined && answers[index] >= 0 ? answers[index] : -1;
                  const userSelectedOption = userAnswer !== -1 ? question.options[userAnswer].trim() : null;
                  const correctAnswer = question.correctAnswer.trim();
                  const isCorrect = userSelectedOption === correctAnswer;
                  
                  console.log(`Question ${index + 1}: userAnswer=${userAnswer}, userSelectedOption=${userSelectedOption}, correctAnswer=${correctAnswer}, isCorrect=${isCorrect}, options=${JSON.stringify(question.options)}`);

                  return (
                    <div 
                      key={question.id} 
                      className="p-6 rounded-2xl border-2 shadow-lg backdrop-blur-sm transform hover:scale-[1.01] transition-all duration-300"
                      style={{
                        backgroundColor: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderColor: isCorrect ? '#22c55e' : '#ef4444',
                        boxShadow: isCorrect ? '0 10px 25px rgba(34, 197, 94, 0.2)' : '0 10px 25px rgba(239, 68, 68, 0.2)'
                      }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span 
                          className="text-sm font-bold px-4 py-2 rounded-full shadow-sm"
                          style={{ 
                            backgroundColor: '#f3f4f6',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          Question {index + 1}
                        </span>
                        <span 
                          className="text-sm font-bold flex items-center px-4 py-2 rounded-full shadow-sm border"
                          style={{
                            backgroundColor: isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: isCorrect ? '#15803d' : '#dc2626',
                            borderColor: isCorrect ? '#22c55e' : '#ef4444'
                          }}
                        >
                          <IonIcon 
                            icon={isCorrect ? checkmarkCircleOutline : closeCircleOutline} 
                            className="mr-2 text-lg" 
                          />
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      
                      <h3 className="font-bold mb-4 text-lg leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {question.text}
                      </h3>
                      
                      {userAnswer !== -1 && !isCorrect && (
                        <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-sm">
                          <p><strong>Your Answer:</strong> {String.fromCharCode(65 + userAnswer)}. {question.options[userAnswer]}</p>
                          <p><strong>Correct Answer:</strong> {question.options.find(option => option.trim() === correctAnswer) ? `${String.fromCharCode(65 + question.options.findIndex(option => option.trim() === correctAnswer))}. ${correctAnswer}` : 'Not found'}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                        {question.options.map((option, optIndex) => {
                          let optionStyle: React.CSSProperties = {
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            border: '2px solid',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s',
                            transform: 'scale(1)',
                            cursor: 'pointer'
                          };
                          
                          if (option.trim() === correctAnswer) {
                            optionStyle = {
                              ...optionStyle,
                              background: 'linear-gradient(to right, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.3))',
                              color: '#15803d',
                              borderColor: '#22c55e',
                              boxShadow: '0 4px 6px rgba(34, 197, 94, 0.3)'
                            };
                          } else if (optIndex === userAnswer && option.trim() !== correctAnswer) {
                            optionStyle = {
                              ...optionStyle,
                              background: 'linear-gradient(to right, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.3))',
                              color: '#dc2626',
                              borderColor: '#ef4444',
                              boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)'
                            };
                          } else {
                            optionStyle = {
                              ...optionStyle,
                              background: 'linear-gradient(to right, #f9fafb, #f3f4f6)',
                              color: 'var(--text-secondary)',
                              borderColor: '#d1d5db'
                            };
                          }
                          
                          return (
                            <div 
                              key={optIndex} 
                              style={optionStyle}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              <span className="font-black text-lg mr-3 opacity-70">
                                {String.fromCharCode(65 + optIndex)}.
                              </span> 
                              {option}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div 
                        className="p-5 rounded-xl shadow-inner"
                        style={{
                          background: 'linear-gradient(to right, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.2))',
                          borderLeft: '4px solid #22c55e'
                        }}
                      >
                        <div className="text-sm">
                          <span className="font-bold flex items-center mb-2 text-base" style={{ color: 'var(--primary-dark)' }}>
                            <IonIcon icon={ribbonOutline} className="mr-2 text-lg" style={{ color: '#22c55e' }} />
                            Explanation:
                          </span>
                          <p className="leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {question.explanation || 'No explanation provided.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-16" style={{ color: 'var(--text-secondary)' }}>
              <IonIcon icon={ribbonOutline} className="text-6xl mb-4 opacity-50" />
              <p className="text-xl font-medium">No question data available for review.</p>
            </div>
          )}
        </div>
      </IonContent>
      
      {/* Enhanced Floating Action Bar */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
        <div 
          className="backdrop-blur-md rounded-3xl shadow-2xl border p-2"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          <div className="flex space-x-2">
            <IonButton
              fill="clear"
              className="h-14 w-20 rounded-2xl shadow-lg transform hover:scale-105 border transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                borderColor: '#d1d5db'
              }}
              onClick={goToHome}
            >
              <div className="flex flex-col items-center justify-center" style={{ color: 'var(--text-primary)' }}>
                <IonIcon icon={homeOutline} className="text-xl mb-1" />
                <span className="text-xs font-bold">Home</span>
              </div>
            </IonButton>
            
            <IonButton
              fill="clear"
              className="h-14 w-20 rounded-2xl shadow-lg transform hover:scale-105 border transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, rgba(204, 160, 0, 0.2), rgba(240, 203, 70, 0.3))',
                borderColor: 'var(--accent-gold)'
              }}
              onClick={shareResults}
            >
              <div className="flex flex-col items-center justify-center" style={{ color: 'var(--primary-dark)' }}>
                <IonIcon icon={shareOutline} className="text-xl mb-1" />
                <span className="text-xs font-bold">Share</span>
              </div>
            </IonButton>
          </div>
        </div>
      </div>
    </IonPage>
  );
};

export default QuizResult;