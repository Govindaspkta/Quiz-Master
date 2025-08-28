import React, { useContext, Suspense, lazy, Component, ReactNode, useEffect, useState } from 'react';
import { IonApp, IonRouterOutlet, IonTabs, setupIonicReact, IonPage, IonContent } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import './theme/variables.css';

const Onboarding = lazy(() => import('./pages/OnBoarding'));
const Welcome = lazy(() => import('./pages/Welcome'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Home = lazy(() => import('./pages/Home'));
const QuizDetails = lazy(() => import('./pages/QuizDetails'));
const QuizPlay = lazy(() => import('./pages/QuizPlay'));
const QuizResult = lazy(() => import('./pages/QuizResult'));
const QuizHistory = lazy(() => import('./pages/QuizHistory'));
const Profile = lazy(() => import('./pages/Profile'));
// const Menu = lazy(() => import('./pages/Menu'));

const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const CreateQuiz = lazy(() => import('./pages/Admin/CreateQuiz'));
const Category = lazy(() => import('./pages/Admin/Category'));
const Users = lazy(() => import('./pages/Admin/Users'));
const CatgoryQuiz = lazy(() => import('./pages/CatgoryQuiz'));

import { AuthContext, AuthProvider } from './context/AuthContext';
import Footer from './components/Footer';
import ManageQuizzes from './pages/Admin/ManageQuizes';
import AdminProfile from './pages/Admin/AdminProfile';
import AddQuestion from './pages/Admin/QuizQuestions';
import AdminDash from './pages/AdminDash';
import ConfirmMode from './pages/Confirm';
import ModeQuizPlay from './pages/ModePlay';
import QuizSearchPage from './pages/Search';
import StandaloneQuestionsCRUD from './pages/Admin/StandAloneQuestion';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null | undefined;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <IonPage>
          <IonContent className="ion-padding">
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message ?? 'Please refresh the page.'}</p>
          </IonContent>
        </IonPage>
      );
    }
    return this.props.children;
  }
}

setupIonicReact();

const AppContent: React.FC = () => {
  const { token, role } = useContext(AuthContext);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize onboarding state from localStorage
  useEffect(() => {
    const onboardingStatus = localStorage.getItem('onboardingCompleted') === 'true';
    setOnboardingCompleted(onboardingStatus);
    
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading while initializing
  if (!isInitialized || onboardingCompleted === null) {
    console.log('App initializing, showing loading screen');
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '50%' }}>Loading...</div>
        </IonContent>
      </IonPage>
    );
  }

  console.log('App initialized with Token:', token, 'Role:', role, 'Onboarding:', onboardingCompleted);

  return (
    <IonApp>
      <IonReactRouter>
        <ErrorBoundary>
          <Suspense
            fallback={
              <IonPage>
                <IonContent className="ion-padding ion-text-center">
                  <div style={{ marginTop: '50%' }}>Loading...</div>
                </IonContent>
              </IonPage>
            }
          >
            {/* Root redirect logic */}
            <Route exact path="/" render={() => {
              console.log('Root route - Onboarding:', onboardingCompleted, 'Token:', token, 'Role:', role);
              
              if (!onboardingCompleted) {
                return <Redirect to="/onboarding" />;
              }
              if (!token) {
                return <Redirect to="/welcome" />;
              }
              if (role === 'admin') {
                return <Redirect to="/admin/adminDashboard" />;
              }
              return <Redirect to="/tabs/home" />;
            }} />

            {/* Onboarding route - only show if not completed */}
          <Route path="/onboarding" exact render={() => {
  console.log('Onboarding route - completed:', onboardingCompleted);
  if (!onboardingCompleted) {
    return <Onboarding setOnboardingCompleted={setOnboardingCompleted} />;
  }
  // If onboarding is completed, redirect based on auth status
  if (!token) {
    return <Redirect to="/welcome" />;
  }
  if (role === 'admin') {
    return <Redirect to="/admin/adminDashboard" />;
  }
  return <Redirect to="/tabs/home" />;
}} />

            {/* Welcome route - only show if onboarding completed but no token */}
            <Route path="/welcome" exact render={() => {
              console.log('Welcome route - onboarding:', onboardingCompleted, 'token:', token);
              if (onboardingCompleted && !token) {
                return <Welcome />;
              }
              // If conditions not met, redirect to root to handle properly
              return <Redirect to="/" />;
            }} />

            <Route path="/login" exact>
              {!token ? <Login /> : <Redirect to="/" />}
            </Route>

            <Route path="/signup" exact>
              {!token ? <Signup /> : <Redirect to="/" />}
            </Route>

            {/* Admin routes */}
            <Route path="/admin">
              {token && role === 'admin' ? (
                <IonPage>
                  <IonContent>
                    <IonRouterOutlet>
                      <Route path="/admin/adminDashboard" exact component={AdminDashboard} />
                      <Route path="/admin/createQuiz" exact component={CreateQuiz} />
                      <Route path="/admin/category" exact component={Category} />
                      <Route path="/admin/users" exact component={Users} />
                      <Route path="/admin/adminprofile" exact component={AdminProfile} />
                      <Route path="/admin/quizQuestion" exact component={AddQuestion} />
                      <Route path="/admin/StandaloneQuestion" exact component={StandaloneQuestionsCRUD} />
                      <Route path="/admin/manageQuizes" exact component={ManageQuizzes} />
                      <Route exact path="/admin">
                        <Redirect to="/admin/adminDashboard" />
                      </Route>
                    </IonRouterOutlet>
                  </IonContent>
                </IonPage>
              ) : (
                <Redirect to="/" />
              )}
            </Route>

            {/* User tabs routes */}
            <Route path="/tabs">
              {token && role !== 'admin' ? (
                <IonPage>
                  <IonContent>
                    <IonTabs>
                      <IonRouterOutlet>
                        <Route path="/tabs/home" exact component={Home} />
                        {/* <Route path="/tabs/menu" exact component={Menu} /> */}
                        <Route path="/tabs/quizdetails/:quizId" exact component={QuizDetails} />
                        <Route path="/tabs/adminDash" exact component={AdminDash} />
                        <Route path="/tabs/quizresult" exact component={QuizResult} />
                        <Route path="/tabs/search" exact component={QuizSearchPage} />
                        <Route path="/tabs/history" exact component={QuizHistory} />
                        <Route path="/tabs/categoryQuiz/:categoryId" exact component={CatgoryQuiz} />
                        <Route path="/tabs/profile" exact component={Profile} />
                        <Route path="/tabs/leaderboard" exact render={() => <div>Leaderboard Page</div>} />
                        <Route path="/tabs/confirmmode" exact component={ConfirmMode} />
                        <Route path="/tabs/quizplay/:id" exact component={QuizPlay} />
                        <Route path="/tabs/modequizplay/:id" component={ModeQuizPlay} />
                        <Route path="/tabs/quizresult/:id" exact component={QuizResult} />
                        <Route exact path="/tabs">
                          <Redirect to="/tabs/home" />
                        </Route>
                      </IonRouterOutlet>
                      <Footer />
                    </IonTabs>
                  </IonContent>
                </IonPage>
              ) : (
                <Redirect to="/" />
              )}
            </Route>
          </Suspense>
        </ErrorBoundary>
      </IonReactRouter>
    </IonApp>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;