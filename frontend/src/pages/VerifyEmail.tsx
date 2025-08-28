import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonText,
  IonButton,
  IonSpinner,
  IonInput,
  IonItem,
  IonIcon,
  isPlatform
} from '@ionic/react';
import { mailOutline } from 'ionicons/icons';
import { Link, useHistory, useParams } from 'react-router-dom';
import api from '../utils/api';
import BackButton from '../components/BackButton';
import '../theme/variables.css';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const VerifyEmail: React.FC = () => {
  const { setToken, setRole } = useContext(AuthContext);
  const history = useHistory();
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    if (token) {
      setStatus('loading');
      api
        .get(`api/auth/verify/${token}`, { withCredentials: true })
        .then((response) => {
          console.log('Verification response:', response.status, response.data);
          if (response.status === 200) {
            setStatus('success');
            setMessage(response.data.message);
            setToken(response.data.token);
            setRole(response.data.role);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            setTimeout(() => history.push(response.data.redirectTo), 2000);
          }
        })
        .catch((err) => {
          console.error('Verification error:', err.response?.data, err.message);
          setStatus('error');
          setMessage(err.response?.data?.message || 'An error occurred during verification.');
        });
    } else {
      setMessage('Please check your email for the verification link sent by QuizMaster.');
    }
  }, [token, history, setToken, setRole]);

  const handleResendEmail = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email to resend the verification link.');
      return;
    }
    setStatus('loading');
    try {
      const response = await api.post('api/auth/resend-verification', { email }, { withCredentials: true });
      console.log('Resend response:', response.status, response.data);
      setStatus('success');
      setMessage('Verification email resent. Please check your inbox and spam folder.');
    } catch (err: any) {
      console.error('Resend error:', err.response?.data, err.message);
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to resend verification email. Please try again.');
    }
  };

  const contentPadding = isPlatform('ios') ? '16px' : '12px';

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--accent-gold)' }}>
          <div className="flex items-center px-2 text-center">
            <BackButton label="" className="mr-2" />
            <IonTitle className="text-[var(--primary-dark)] font-bold">
              Verify Email
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
            <h1 className="text-4xl font-bold text-[var(--primary-dark)] mb-2">Verify Your Email</h1>
          </IonText>

          {status === 'loading' && (
            <IonSpinner name="crescent" className="mb-4" />
          )}
          {status === 'success' && (
            <IonText className="text-green-500 mb-4">
              {message}
            </IonText>
          )}
          {(status === 'error' || status === 'pending') && (
            <>
              <IonText className="text-[var(--text-secondary)] mb-4">
                {message}
              </IonText>
              <IonItem className="w-80 mb-4 rounded-lg border border-gray-300">
                <IonIcon icon={mailOutline} slot="start" className="text-[var(--primary-medium)]" />
                <IonInput
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onIonChange={(e) => setEmail(e.detail.value!)}
                  className="text-[var(--text-primary)]"
                />
              </IonItem>
              <IonButton
                className="custom-gradient-button w-64 mb-4"
                onClick={handleResendEmail}
              >
                Resend Verification Email
              </IonButton>
            </>
          )}

          <IonText className="text-sm text-gray-600">
            Already verified?{' '}
            <Link to="/login" className="text-blue-600 underline">
              Login
            </Link>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VerifyEmail;