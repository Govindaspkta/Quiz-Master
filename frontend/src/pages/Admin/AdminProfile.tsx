import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton } from '@ionic/react';
import { AuthContext } from '../../context/AuthContext'; // Adjust path as needed
import api from '../../utils/api'; // Your API setup

const AdminProfile = () => {
  const { token, setToken } = useContext(AuthContext);
  const history = useHistory();

  // Redirect if not authenticated
  if (!token) {
    history.push('/login');
    return null;
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setToken(null);
      history.push('/login');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/adminDashboard" />
          </IonButtons>
          <IonTitle>Admin Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Admin Profile</h1>
        <IonButton 
          onClick={handleLogout} 
          color="danger"
          className="px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AdminProfile;