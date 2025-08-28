import React from 'react';
import { IonTabBar, IonTabButton, IonIcon, IonLabel, isPlatform } from '@ionic/react';
import { homeOutline, timeOutline, personOutline, menuOutline, trophyOutline } from 'ionicons/icons';
import '../theme/variables.css';

const Footer: React.FC = () => {
  // Platform-specific styles for the tab bar
  const tabBarHeight = isPlatform('ios') ? '70px' : '60px';
  const tabBarPadding = isPlatform('ios') ? '10px 0' : '5px 0';

  return (
    <IonTabBar
      slot="bottom"
      className="bg-white border-t shadow-sm"
      style={{ 
        borderTopWidth: '4px', 
        borderTopColor: '#003566',
        height: tabBarHeight,
        padding: tabBarPadding
      }}
    >
      {/* Leaderboard button - left side */}
      <IonTabButton
        tab="leaderboard"
        href="/tabs/leaderboard"
        className="text-[var(--primary-dark)]"
      >
        <IonIcon icon={trophyOutline} className="text-xl" />
        <IonLabel className="text-xs">Leaderboard</IonLabel>
      </IonTabButton>

      {/* Profile button - left side */}
      <IonTabButton
        tab="profile"
        href="/tabs/profile"
        className="text-[var(--primary-dark)]"
      >
        <IonIcon icon={personOutline} className="text-xl" />
        <IonLabel className="text-xs">Profile</IonLabel>
      </IonTabButton>

      {/* Home button - center with special styling */}
      <IonTabButton
        tab="home"
        href="/tabs/home"
        className="relative -top-4 bg-[var(--primary-medium)] rounded-full w-14 h-14 mx-auto flex flex-col items-center justify-center shadow-lg"
        style={{
          padding: 0,
          margin: 0
        }}
      >
        <div className="h-full w-full flex flex-col items-center justify-center">
          <IonIcon icon={homeOutline} className="text-2xl text-white mb-1" />
          <IonLabel className="text-xs text-white">Home</IonLabel>
        </div>
      </IonTabButton>

      {/* History button - right side */}
      <IonTabButton
        tab="history"
        href="/tabs/history"
        className="text-[var(--primary-dark)]"
      >
        <IonIcon icon={timeOutline} className="text-xl" />
        <IonLabel className="text-xs">History</IonLabel>
      </IonTabButton>

      {/* Menu button - right side */}
      <IonTabButton
        tab="menu"
        href="/tabs/menu"
        className="text-[var(--primary-dark)]"
      >
        <IonIcon icon={menuOutline} className="text-xl" />
        <IonLabel className="text-xs">Menu</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

export default Footer;