import React from 'react';
import { IonPage, IonContent, IonButton, IonText, useIonRouter } from '@ionic/react';
import { motion } from 'framer-motion';
import '../theme/variables.css';

const Welcome: React.FC = () => {
  const router = useIonRouter();

  const handleLogin = () => {
    router.push('/login', 'forward', 'push');
  };

  const handleSignup = () => {
    router.push('/signup', 'forward', 'push');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="h-screen w-full flex flex-col items-center justify-center text-center"
        >
          <IonText>
            <h1 className="text-4xl font-bold text-blue-600">QuizMaster</h1>
            <p className="text-lg text-gray-600 mt-4">Join the fun and test your knowledge!</p>
          </IonText>
          <div className="mt-8 flex flex-col space-y-4 w-64">
            <IonButton
              className="custom-gradient-button"
              onClick={handleLogin}
            >
              Login
            </IonButton>
            <IonButton
              className="custom-gradient-button"
              onClick={handleSignup}
            >
              Sign Up
            </IonButton>
          </div>
        </motion.div>
      </IonContent>
    </IonPage>
  );
};

export default Welcome;