import React, { useState } from 'react';
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
  IonIcon,
  isPlatform
} from '@ionic/react';
import { logoGoogle, lockClosedOutline, mailOutline, personOutline } from 'ionicons/icons';
import { Link, useHistory } from 'react-router-dom';
import api from '../utils/api';
import BackButton from '../components/BackButton';
import '../theme/variables.css';

const Signup: React.FC = () => {
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedUsername) {
      setError('Username is required');
      return;
    }
    if (!usernameRegex.test(trimmedUsername)) {
      setError('Username must be at least 3 characters and contain only letters, numbers, or underscores');
      return;
    }

    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!trimmedPassword) {
      setError('Password is required');
      return;
    }
    if (!passwordRegex.test(trimmedPassword)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character');
      return;
    }

    if (!trimmedConfirmPassword) {
      setError('Please confirm your password');
      return;
    }
    if (trimmedPassword !== trimmedConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      console.log('Sending signup request to http://localhost:5000/api/auth/register:', { username: trimmedUsername, email: trimmedEmail, password: trimmedPassword });
      const response = await api.post('api/auth/register', {
        username: trimmedUsername,
        email: trimmedEmail,
        password: trimmedPassword
      });
      console.log('Signup response status:', response.status, 'data:', response.data);

      if (response.status === 201) {
        const { token, redirectTo } = response.data;
        localStorage.setItem('token', token);
        history.push(redirectTo);
      }
    } catch (err: any) {
      console.error('Signup error details:', err.response?.status, err.response?.data, err.message);
      setError(err.response?.data?.message || 'An error occurred during signup. Please try again.');
    }
  };

  const handleGoogleSignup = () => {
    console.log('Continue with Google clicked');
  };

  const contentPadding = isPlatform('ios') ? '16px' : '12px';
  const buttonWidth = isPlatform('ios') ? 'w-72' : 'w-64';

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--accent-gold)' }}>
          <div className="flex items-center px-2 text-center">
            <BackButton label="" className="mr-2" />
            <IonTitle className="text-[var(--primary-dark)] font-bold">
              Sign Up
            </IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent 
        fullscreen 
        className="ion-no-padding" 
        scrollY={false}
        style={{ '--padding-start': contentPadding, '--padding-end': contentPadding }}
      >
        <div className="h-full w-full flex flex-col items-center justify-center text-center p-6">
          <IonText>
            <h1 className="text-4xl font-bold text-[var(--primary-dark)] mb-2">Join QuizMaster!</h1>
            <p className="text-lg text-[var(--text-secondary)] mb-8">Create an account to start your journey.</p>
          </IonText>

          {error && (
            <IonText className="text-red-500 mb-4">
              {error}
            </IonText>
          )}

          <IonItem className="w-80 mb-4 rounded-lg border border-gray-300">
            <IonIcon icon={personOutline} slot="start" className="text-[var(--primary-medium)]" />
            <IonInput
              type="text"
              placeholder="Username"
              value={username}
              onIonChange={(e) => setUsername(e.detail.value!)}
              className="text-[var(--text-primary)]"
            />
          </IonItem>

          <IonItem className="w-80 mb-4 rounded-lg border border-gray-300">
            <IonIcon icon={mailOutline} slot="start" className="text-[var(--primary-medium)]" />
            <IonInput
              type="email"
              placeholder="Email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
              className="text-[var(--text-primary)]"
            />
          </IonItem>

          <IonItem className="w-80 mb-4 rounded-lg border border-gray-300">
            <IonIcon icon={lockClosedOutline} slot="start" className="text-[var(--primary-medium)]" />
            <IonInput
              type="password"
              placeholder="Password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
              className="text-[var(--text-primary)]"
            />
          </IonItem>

          <IonItem className="w-80 mb-4 rounded-lg border border-gray-300">
            <IonIcon icon={lockClosedOutline} slot="start" className="text-[var(--primary-medium)]" />
            <IonInput
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onIonChange={(e) => setConfirmPassword(e.detail.value!)}
              className="text-[var(--text-primary)]"
            />
          </IonItem>

          <IonText className="text-sm text-gray-600 mb-6 px-4">
            By signing up, you accept QuizMaster’s{' '}
            <Link to="/terms" className="text-blue-600 underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/policy" className="text-blue-600 underline">
              Privacy Policy
            </Link>.
          </IonText>

          <IonButton
            className={`custom-gradient-button ${buttonWidth} mb-4 flex items-center justify-center`}
            onClick={handleGoogleSignup}
          >
            <IonIcon icon={logoGoogle} slot="start" className="mr-2 text-[var(--primary-dark)]" />
            <IonLabel>Continue with Google</IonLabel>
          </IonButton>

          <IonButton
            className={`custom-gradient-button ${buttonWidth} mb-4`}
            onClick={handleSignup}
          >
            Sign Up
          </IonButton>

          <IonText className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 underline">
              Login
            </Link>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Signup;
