import React from 'react';
import { IonPage, IonContent, IonButton, IonText, useIonRouter } from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/pagination';
import '../theme/variables.css';

const Onboarding: React.FC<{ setOnboardingCompleted: (completed: boolean) => void }> = ({ setOnboardingCompleted }) => {
  const router = useIonRouter();

  console.log('Rendering Onboarding component');

  const handleStartNow = () => {
    localStorage.setItem('onboardingCompleted', 'true'); // Mark onboarding as complete
    setOnboardingCompleted(true); // Update the app state immediately to prevent redirect loops
    router.push('/welcome', 'forward', 'push');
  };
  return (
    <IonPage>
      <IonContent fullscreen className="" scrollY={false}>
        <div className="h-screen w-full">
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            slidesPerView={1}
            className="h-full w-full"
          >
            {/* Slide 1 */}
            <SwiperSlide>
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-6">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="flex flex-col items-center"
                >
                  <IonText>
                    <h1 className="text-3xl font-bold text-blue-600">Welcome to QuizMaster!</h1>
                    <p className="text-lg text-gray-600 mt-4">Test your knowledge with fun quizzes.</p>
                  </IonText>
                </motion.div>
              </div>
            </SwiperSlide>

            {/* Slide 2 */}
            <SwiperSlide>
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-6">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="flex flex-col items-center"
                >
                  <IonText>
                    <h1 className="text-3xl font-bold text-gray-800">Exciting Features</h1>
                    <p className="text-lg text-gray-600 mt-4">Compete with friends and track your progress!</p>
                  </IonText>
                </motion.div>
              </div>
            </SwiperSlide>

            {/* Slide 3 */}
            <SwiperSlide>
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-6">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="flex flex-col items-center"
                >
                  <IonText>
                    <h1 className="text-3xl font-bold text-gray-800">Get Started</h1>
                    <p className="text-lg text-gray-600 mt-4">Start your journey today!</p>
                  </IonText>
                  <IonButton
                    className="custom-gradient-button mt-8 w-48"
                    onClick={handleStartNow}
                  >
                    Start Now
                  </IonButton>
                </motion.div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Onboarding;