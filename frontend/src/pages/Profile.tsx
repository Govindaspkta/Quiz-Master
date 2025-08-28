import React, { useContext, useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonText,
  IonButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonAvatar,
  IonList,
  IonToggle,
  IonAlert,
  isPlatform,
  IonRippleEffect
} from '@ionic/react';
import {
  personOutline,
  settingsOutline,
  notificationsOutline,
  helpCircleOutline,
  informationCircleOutline,
  logOutOutline,
  chevronForwardOutline,
  mailOutline,
  callOutline,
  locationOutline,
  shieldCheckmarkOutline,
  moonOutline,
  languageOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import BackButton from '../components/BackButton';
import '../theme/variables.css';
import './Profile.css';

const Profile: React.FC = () => {
  const history = useHistory();
  const { token, setToken } = useContext(AuthContext);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '+1 234 567 8900',
    location: 'New York, NY',
    avatar: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setError('No authentication token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Profile data fetched:', response.data);
        setUserData(prev => ({
          ...prev,
          name: response.data.username || response.data.name || prev.name,
          email: response.data.email || prev.email
        }));
      } catch (err: any) {
        console.error('Failed to fetch profile - Details:', err.response?.status, err.response?.data, err.message);
        setError(`Failed to load profile data. Status: ${err.response?.status || 'Unknown'}. Error: ${err.response?.data?.message || err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  const handleLogout = async () => {
    setShowLogoutAlert(false); // Dismiss alert immediately
    try {
      await api.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Logout successful');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setToken(null);
      history.push('/welcome');
    }
  };

  // Platform-specific styles
  const contentPadding = isPlatform('ios') ? '80px' : '70px';

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonText>Loading profile...</IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent 
        className="ion-padding scrollbar-hide" 
        style={{ 
          backgroundColor: 'var(--background)', 
          '--padding-bottom': contentPadding 
        }}
      >
        <div className="taskbar">
          <BackButton label="Back" className="mr-4" />
          <IonText className="text-2xl font-bold text-[var(--text-primary)]">
            Profile
          </IonText>
        </div>

        {error && (
          <IonText className="text-red-500 mb-4 text-center">
            {error}
          </IonText>
        )}

        {/* User Info Card */}
        <IonCard className="mb-4" style={{ 
          '--background': 'var(--background)',
          boxShadow: '0 2px 8px rgba(204, 160, 0, 0.15)',
          border: '1px solid rgba(204, 160, 0, 0.1)'
        }}>
          <IonCardContent className="text-center py-6">
            <IonAvatar className="mx-auto mb-4 w-20 h-20">
              {userData.avatar ? (
                <img src={userData.avatar} alt="Profile" />
              ) : (
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: 'var(--accent-gold)' }}
                >
                  {userData.name ? userData.name.split(' ').map(n => n[0]).join('') : 'U'}
                </div>
              )}
            </IonAvatar>
            <IonText className="text-xl font-bold text-[var(--text-primary)] block mb-2">
              {userData.name || 'Unknown User'}
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* Contact Information */}
        <IonCard className="mb-4" style={{ 
          '--background': 'var(--background)',
          boxShadow: '0 2px 8px rgba(204, 160, 0, 0.15)',
          border: '1px solid rgba(204, 160, 0, 0.1)'
        }}>
          <IonCardContent className="p-0">
            <IonList>
              <IonItem lines="none" className="py-2">
                <IonIcon 
                  icon={mailOutline} 
                  slot="start" 
                  style={{ color: 'var(--accent-gold)' }}
                />
                <IonLabel>
                  <h3 className="text-[var(--text-primary)] font-medium">Email</h3>
                  <p className="text-[var(--text-secondary)] text-sm">{userData.email || 'Not available'}</p>
                </IonLabel>
              </IonItem>
              
              <IonItem lines="none" className="py-2">
                <IonIcon 
                  icon={callOutline} 
                  slot="start" 
                  style={{ color: 'var(--accent-gold)' }}
                />
                <IonLabel>
                  <h3 className="text-[var(--text-primary)] font-medium">Phone</h3>
                  <p className="text-[var(--text-secondary)] text-sm">{userData.phone}</p>
                </IonLabel>
              </IonItem>
              
              <IonItem lines="none" className="py-2">
                <IonIcon 
                  icon={locationOutline} 
                  slot="start" 
                  style={{ color: 'var(--accent-gold)' }}
                />
                <IonLabel>
                  <h3 className="text-[var(--text-primary)] font-medium">Location</h3>
                  <p className="text-[var(--text-secondary)] text-sm">{userData.location}</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Settings Section */}
        <IonCard className="mb-4" style={{ 
          '--background': 'var(--background)',
          boxShadow: '0 2px 8px rgba(204, 160, 0, 0.15)',
          border: '1px solid rgba(204, 160, 0, 0.1)'
        }}>
          <IonCardContent className="p-0">
            <IonList>
              <IonItem button lines="none" className="py-3 ion-activatable" routerLink="/edit-profile">
                <IonIcon 
                  icon={personOutline} 
                  slot="start" 
                  style={{ color: 'var(--accent-gold)' }}
                />
                <IonLabel>
                  <h3 className="text-[var(--text-primary)] font-medium">Edit Profile</h3>
                </IonLabel>
                <IonIcon 
                  icon={chevronForwardOutline} 
                  slot="end" 
                  style={{ color: 'var(--text-secondary)' }}
                />
                <IonRippleEffect />
              </IonItem>
              
              <IonItem lines="none" className="py-3">
                <IonIcon 
                  icon={notificationsOutline} 
                  slot="start" 
                  style={{ color: 'var(--accent-gold)' }}
                />
                <IonLabel>
                  <h3 className="text-[var(--text-primary)] font-medium">Notifications</h3>
                </IonLabel>
                <IonToggle 
                  checked={notificationsEnabled}
                  onIonChange={(e) => setNotificationsEnabled(e.detail.checked)}
                  style={{
                    '--handle-background': '#ffffff',
                    '--handle-background-checked': '#ffffff',
                    '--background': '#cccccc',
                    '--background-checked': 'var(--accent-gold)'
                  }}
                />
              </IonItem>
              
              <IonItem lines="none" className="py-3">
                <IonIcon 
                  icon={moonOutline} 
                  slot="start" 
                  style={{ color: 'var(--accent-gold)' }}
                />
                <IonLabel>
                  <h3 className="text-[var(--text-primary)] font-medium">Dark Mode</h3>
                </IonLabel>
                <IonToggle 
                  checked={darkMode}
                  onIonChange={(e) => setDarkMode(e.detail.checked)}
                  style={{
                    '--handle-background': '#ffffff',
                    '--handle-background-checked': '#ffffff',
                    '--background': '#cccccc',
                    '--background-checked': 'var(--accent-gold)'
                  }}
                />
              </IonItem>
              
              <IonItem button lines="none" className="py-3 ion-activatable" routerLink="/language">
                <IonIcon 
                  icon={languageOutline} 
                  slot="start" 
                  style={{ color: 'var(--accent-gold)' }}
                />
                <IonLabel>
                  <h3 className="text-[var(--text-primary)] font-medium">Language</h3>
                  <p className="text-[var(--text-secondary)] text-sm">English</p>
                </IonLabel>
                <IonIcon 
                  icon={chevronForwardOutline} 
                  slot="end" 
                  style={{ color: 'var(--text-secondary)' }}
                />
                <IonRippleEffect />
              </IonItem>
              
              <IonItem button lines="none" className="py-3 ion-activatable" routerLink="/privacy">
                <IonIcon 
                  icon={shieldCheckmarkOutline} 
                  slot="start" 
                  style={{ color: 'var(--accent-gold)' }}
                />
                <IonLabel>
                  <h3 className="text-[var(--text-primary)] font-medium">Privacy & Security</h3>
                </IonLabel>
                <IonIcon 
                  icon={chevronForwardOutline} 
                  slot="end" 
                  style={{ color: 'var(--text-secondary)' }}
                />
                <IonRippleEffect />
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Support Section */}
        <IonCard className="mb-4" style={{ 
          '--background': 'var(--background)',
          boxShadow: '0 2px 8px rgba(204, 160, 0, 0.15)',
          border: '1px solid rgba(204, 160, 0, 0.1)'
        }}>
          <IonCardContent className="p-0">
            <IonList>
              <IonItem button lines="none" className="py-3 ion-activatable" routerLink="/help">
                <IonIcon 
                  icon={helpCircleOutline} 
                  slot="start" 
                  style={{ color: 'var(--accent-gold)' }}
                />
                <IonLabel>
                  <h3 className="text-[var(--text-primary)] font-medium">Help & Support</h3>
                </IonLabel>
                <IonIcon 
                  icon={chevronForwardOutline} 
                  slot="end" 
                  style={{ color: 'var(--text-secondary)' }}
                />
                <IonRippleEffect />
              </IonItem>
              
              <IonItem button lines="none" className="py-3 ion-activatable" routerLink="/about">
                <IonIcon 
                  icon={informationCircleOutline} 
                  slot="start" 
                  style={{ color: 'var(--accent-gold)' }}
                />
                <IonLabel>
                  <h3 className="text-[var(--text-primary)] font-medium">About</h3>
                  <p className="text-[var(--text-secondary)] text-sm">Version 1.0.0</p>
                </IonLabel>
                <IonIcon 
                  icon={chevronForwardOutline} 
                  slot="end" 
                  style={{ color: 'var(--text-secondary)' }}
                />
                <IonRippleEffect />
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Logout Button */}
        <div className="mt-6 mb-8">
          <IonButton
            fill="clear"
            expand="block"
            onClick={() => setShowLogoutAlert(true)}
            className="ion-activatable relative overflow-hidden"
            style={{
              '--background-activated': 'rgba(220, 53, 69, 0.1)',
              '--background-focused': 'rgba(220, 53, 69, 0.1)',
              '--background-hover': 'rgba(220, 53, 69, 0.1)',
              '--color': '#dc3545',
              '--border-color': '#dc3545',
              '--border-width': '2px',
              '--border-style': 'solid',
              '--border-radius': '12px',
              '--padding-top': '16px',
              '--padding-bottom': '16px',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            <IonIcon icon={logOutOutline} slot="start" />
            Sign Out
            <IonRippleEffect />
          </IonButton>
        </div>

        {/* Logout Confirmation Alert */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Sign Out"
          message="Are you sure you want to sign out of your account?"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'alert-button-cancel',
              handler: () => setShowLogoutAlert(false)
            },
            {
              text: 'Sign Out',
              role: 'confirm',
              cssClass: 'alert-button-confirm',
              handler: handleLogout
            },
          ]}
          cssClass="custom-alert"
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;