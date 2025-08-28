import React from 'react';
import { IonButton, IonIcon, isPlatform, useIonRouter } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import '../theme/variables.css';

// Platform-specific styling adjustments
const getPlatformStyles = () => {
  return isPlatform('ios') ? {
    padding: '8px 12px',
    fontSize: '16px',
  } : {
    padding: '6px 10px',
    fontSize: '14px',
  };
};

interface BackButtonProps {
  label?: string; // Optional label for the button
  defaultRedirect?: string; // Optional default redirect if there's no previous page
  className?: string; // Optional custom class for additional styling
}

const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  defaultRedirect = '/tabs/home',
  className = '',
}) => {
  const router = useIonRouter();
  const platformStyles = getPlatformStyles();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.goBack();
    } else {
      router.push(defaultRedirect, 'back', 'replace');
    }
  };

  return (
    <IonButton
      fill="clear"
      className={`text-[var(--primary-dark)] font-medium transition-transform duration-200 hover:text-[var(--accent-gold)] ${className}`}
      style={{
        padding: platformStyles.padding,
        fontSize: platformStyles.fontSize,
        '--border-radius': '8px',
        '--box-shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
      onClick={handleBack}
    >
      <IonIcon slot="start" icon={arrowBackOutline} className="text-xl" />
      {label}
    </IonButton>
  );
};

export default BackButton;