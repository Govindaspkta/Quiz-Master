import React, { useState, useContext, lazy, Suspense } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonText,
  IonInput,
  IonButton,
  IonLabel,
  IonItem,
  IonSpinner,
  isPlatform,
} from '@ionic/react';
import { lockClosedOutline, mailOutline } from 'ionicons/icons';
import { Link, useHistory } from 'react-router-dom';
import api from '../utils/api';
import BackButton from '../components/BackButton';
import { AuthContext } from '../context/AuthContext';
import '../theme/variables.css';

const IonIcon = lazy(() =>
  import('@ionic/react').then((module) => ({ default: module.IonIcon as React.ComponentType<any> }))
);

interface CustomIonIconProps {
  icon: any;
  slot?: string;
  className?: string;
  [key: string]: any;
}

const IconWrapper: React.FC<CustomIonIconProps> = ({ icon, ...rest }) => (
  <Suspense fallback={<div className="w-6 h-6" />}>
    <IonIcon icon={icon} {...rest} />
  </Suspense>
);

const Login: React.FC = () => {
  const history = useHistory();
  const { setToken, setRole } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setErrors({});
    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });

      if (response.status === 200) {
        const { token, redirectTo, role } = response.data;
        
        // Simple fix - just call the functions, TypeScript will handle the rest
        setToken(token);
        setRole(role);
        
        // Small delay to ensure storage completes
        setTimeout(() => {
          history.push(redirectTo);
        }, 100);
      }
    } catch (err: any) {
      setErrors({ general: err.response?.data?.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const contentPadding = isPlatform('ios') ? '16px' : '12px';
  const buttonWidth = isPlatform('ios') ? 'w-72' : 'w-64';

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--accent-gold)' }}>
          <div className="flex items-center px-4">
            <BackButton label="" className="mr-2" />
            <IonTitle className="text-[var(--primary-dark)] font-bold text-center">
              Log In
            </IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        className="bg-white ion-no-padding"
        scrollY={false}
        style={{ '--padding-start': contentPadding, '--padding-end': contentPadding }}
      >
        <div className="h-screen w-full flex flex-col items-center justify-center text-center p-6">
          <IonText>
            <h1 className="text-4xl font-bold text-[var(--primary-dark)] mb-2">Welcome Back!</h1>
            <p className="text-lg text-[var(--text-secondary)] mb-8">
              Log in to continue your QuizMaster journey.
            </p>
          </IonText>

          {errors.general && (
            <IonText className="text-red-500 mb-4">
              {errors.general}
            </IonText>
          )}

          <IonItem className="w-80 mb-4 rounded-lg border border-gray-300">
            <IconWrapper
              icon={mailOutline}
              slot="start"
              className="text-[var(--primary-medium)]"
            />
            <IonInput
              type="email"
              placeholder="Email"
              value={email}
              onIonChange={(e) => {
                setEmail(e.detail.value!);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className="text-[var(--text-primary)]"
            />
          </IonItem>
          {errors.email && (
            <IonText className="text-red-500 text-sm mb-2 w-80 text-left">{errors.email}</IonText>
          )}

          <IonItem className="w-80 mb-4 rounded-lg border border-gray-300">
            <IconWrapper
              icon={lockClosedOutline}
              slot="start"
              className="text-[var(--primary-medium)]"
            />
            <IonInput
              type="password"
              placeholder="Password"
              value={password}
              onIonChange={(e) => {
                setPassword(e.detail.value!);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className="text-[var(--text-primary)]"
            />
          </IonItem>
          {errors.password && (
            <IonText className="text-red-500 text-sm mb-2 w-80 text-left">{errors.password}</IonText>
          )}

          <Link to="/forgetPassword" className="text-sm text-blue-600 underline mb-6">
            Forgot Password?
          </Link>

          <IonButton
            className={`custom-gradient-button ${buttonWidth} mb-4`}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? <IonSpinner name="crescent" /> : 'Login'}
          </IonButton>

          <IonText className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 underline">
              Sign Up
            </Link>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;