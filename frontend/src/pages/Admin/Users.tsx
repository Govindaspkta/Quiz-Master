import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons
} from '@ionic/react';
import { arrowBack, personAdd, ellipsisVertical, filter } from 'ionicons/icons';
import BackButton from '../../components/BackButton';
import api from '../../utils/api';

interface User {
  id: number;
  name: string;
  email: string;
  quizzes: number;
  avgScore: number;
  lastActive: string;
  status: string;
}

const Users = () => {
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState<User[]>([]); // State for fetched users
  const [loading, setLoading] = useState(true); // State for loading

  // Fetch users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        console.log('Fetched users:', response.data); // Debug log
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]); // Set to empty array on error
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchText.toLowerCase()) || 
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  // Calculate total users dynamically
  const totalUsers = users.length;
  const formattedTotalUsers = totalUsers.toLocaleString(); // Format with commas

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="bg-red-600">
          <IonButtons>
            <BackButton />
          </IonButtons>
          <IonTitle>Users Management</IonTitle>
          <IonButton slot="end" fill="clear" color="light">
            <IonIcon icon={personAdd} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="bg-gray-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">
              {loading ? 'Loading...' : `${formattedTotalUsers} Total Users`}
            </div>
            <div className="text-sm text-green-500 font-medium">+12% this month</div>
          </div>
          
          <div className="rounded-lg shadow mb-6">
            <div className="flex items-center justify-between p-4">
              <IonSearchbar
                value={searchText}
                onIonChange={e => setSearchText(e.detail.value ?? '')}
                placeholder="Search users"
                className="p-0"
              />
              <div className="flex">
                <IonButton fill="clear" color="medium">
                  <IonIcon slot="icon-only" icon={filter} />
                </IonButton>
              </div>
            </div>
            
            <IonGrid className="border-b border-gray-200 p-0">
              <IonRow className="bg-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <IonCol size="4" className="py-3 pl-4">User</IonCol>
                <IonCol size="2" className="py-3 text-center">Quizzes</IonCol>
                <IonCol size="2" className="py-3 text-center">Avg Score</IonCol>
                <IonCol size="2" className="py-3 text-center">Last Active</IonCol>
                <IonCol size="2" className="py-3 text-center">Status</IonCol>
              </IonRow>
            </IonGrid>
            
            <IonList className="rounded-b-lg">
              {loading ? (
                <IonItem>
                  <IonLabel>Loading users...</IonLabel>
                </IonItem>
              ) : filteredUsers.length === 0 ? (
                <IonItem>
                  <IonLabel>No users found</IonLabel>
                </IonItem>
              ) : (
                filteredUsers.map(user => (
                  <IonItem key={user.id} className="py-2">
                    <IonGrid className="p-0">
                      <IonRow className="items-center">
                        <IonCol size="4">
                          <div className="flex flex-col">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </IonCol>
                        <IonCol size="2" className="text-center">{user.quizzes}</IonCol>
                        <IonCol size="2" className="text-center">{user.avgScore}%</IonCol>
                        <IonCol size="2" className="text-center text-xs text-gray-500">{user.lastActive}</IonCol>
                        <IonCol size="2" className="text-center">
                          <IonChip
                            className={`text-xs font-medium ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' :
                              user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                              user.status === '' ? 'bg-gray-100 text-gray-800' :  // Handle empty status
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.status || 'N/A'}  {/* Show 'N/A' if status is empty */}
                          </IonChip>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                    <IonButton slot="end" fill="clear" color="medium">
                      <IonIcon slot="icon-only" icon={ellipsisVertical} />
                    </IonButton>
                  </IonItem>
                ))
              )}
            </IonList>
          </div>
          
          <div className="rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-medium mb-4">User Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Active Users</div>
                <div className="text-2xl font-bold mt-1">9,846</div>
                <div className="text-xs text-green-500 mt-1">+8% this month</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">New Users</div>
                <div className="text-2xl font-bold mt-1">1,254</div>
                <div className="text-xs text-green-500 mt-1">+15% this month</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Quizzes per User</div>
                <div className="text-2xl font-bold mt-1">12.6</div>
                <div className="text-xs text-red-500 mt-1">-2% this month</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Avg. Engagement</div>
                <div className="text-2xl font-bold mt-1">68%</div>
                <div className="text-xs text-green-500 mt-1">+5% this month</div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
            <IonList>
              <IonItem lines="full">
                <IonLabel>
                  <h2 className="font-medium">Alex Johnson</h2>
                  <p className="text-sm text-gray-500">Completed "Science Quiz" with 85%</p>
                </IonLabel>
                <div slot="end" className="text-xs text-gray-500">2 hours ago</div>
              </IonItem>
              <IonItem lines="full">
                <IonLabel>
                  <h2 className="font-medium">Maria Garcia</h2>
                  <p className="text-sm text-gray-500">Created a new account</p>
                </IonLabel>
                <div slot="end" className="text-xs text-gray-500">6 hours ago</div>
              </IonItem>
              <IonItem lines="full">
                <IonLabel>
                  <h2 className="font-medium">James Williams</h2>
                  <p className="text-sm text-gray-500">Updated profile information</p>
                </IonLabel>
                <div slot="end" className="text-xs text-gray-500">1 day ago</div>
              </IonItem>
              <IonItem lines="none">
                <IonLabel>
                  <h2 className="font-medium">Sarah Davis</h2>
                  <p className="text-sm text-gray-500">Completed "History Quiz" with 92%</p>
                </IonLabel>
                <div slot="end" className="text-xs text-gray-500">2 days ago</div>
              </IonItem>
            </IonList>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Users;