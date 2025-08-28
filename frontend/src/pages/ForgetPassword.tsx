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
  IonItem, 
  IonIcon,
  isPlatform,
} from '@ionic/react';
import { mailOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import '../theme/variables.css';

// Platform-specific styling adjustments
const getPlatformStyles = () => {
  return isPlatform('ios') ? {
    padding: '24px',
    inputWidth: '90%',
    buttonWidth: '70%',
  } : {
    padding: '16px',
    inputWidth: '80%',
    buttonWidth: '60%',
  };
};

const ForgetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const platformStyles = getPlatformStyles();

  const handleResetPassword = () => {
    // Add your reset password logic here (e.g., API call)
    console.log('Reset password requested for:', { email });
  };

  return (
    <IonPage>
      {/* Header with BackButton and Title */}
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'var(--accent-gold)' }}>
          <div className="flex items-center px-4">
            <BackButton label="" className="mr-2" />
            <IonTitle className="text-[var(--primary-dark)] font-bold">
              Forgot Password
            </IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent 
        fullscreen 
        className=" ion-no-padding" 
        scrollY={false}
        style={{ '--z-index': '10' }}
      >
        <div 
          className="h-full w-full flex flex-col items-center justify-center text-center"
          style={{ padding: platformStyles.padding }}
        >
          {/* Header */}
          <IonText>
            <h1 className="text-4xl font-bold text-[var(--primary-dark)] mb-2">Forgot Password?</h1>
            <p className="text-lg text-[var(--text-secondary)] mb-8">Enter your email to reset your password.</p>
          </IonText>

          {/* Email Input */}
          <IonItem 
            className={`mb-4 rounded-lg border border-gray-300`} 
            style={{ width: platformStyles.inputWidth }}
          >
            <IonIcon icon={mailOutline} slot="start" className="text-[var(--primary-medium)]" />
            <IonInput
              type="email"
              placeholder="Email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
              className="text-[var(--text-primary)]"
            />
          </IonItem>

          {/* Send Reset Link Button */}
          <IonButton
            className="custom-gradient-button mb-4 flex items-center justify-center"
            style={{ width: platformStyles.buttonWidth }}
            onClick={handleResetPassword}
          >
            Send Reset Link
          </IonButton>

          {/* Back to Login Link */}
          <IonText className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 underline">
              Back to Login
            </Link>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ForgetPassword;