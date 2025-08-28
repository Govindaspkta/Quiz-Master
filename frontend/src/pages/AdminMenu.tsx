import React from 'react';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonMenuToggle,
} from '@ionic/react';
import {
  homeOutline,
  cartOutline,
  peopleOutline,
  personOutline,
  businessOutline,
  cashOutline,
  eyeOutline,
} from 'ionicons/icons';
import { useLocation } from 'react-router-dom';

const AdminMenu: React.FC = () => {
  const location = useLocation();

  return (
    <IonMenu contentId="main-content" type="overlay">
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle>Menu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonMenuToggle autoHide={false}>
            <IonItem
              routerLink="/admin/dashboard"
              routerDirection="none"
              detail={false}
              className={location.pathname === '/admin/dashboard' ? 'bg-gray-100' : ''}
            >
              <IonIcon slot="start" icon={homeOutline} />
              <IonLabel>Overview</IonLabel>
            </IonItem>
            <IonItem
              routerLink="/admin/ecommerce"
              routerDirection="none"
              detail={false}
              className={location.pathname === '/admin/ecommerce' ? 'bg-gray-100' : ''}
            >
              <IonIcon slot="start" icon={cartOutline} />
              <IonLabel>eCommerce</IonLabel>
            </IonItem>
            <IonItem
              routerLink="/admin/orders"
              routerDirection="none"
              detail={false}
              className={location.pathname === '/admin/orders' ? 'bg-gray-100' : ''}
            >
              <IonIcon slot="start" icon={cartOutline} />
              <IonLabel>Orders</IonLabel>
            </IonItem>
            <IonItem
              routerLink="/admin/customers"
              routerDirection="none"
              detail={false}
              className={location.pathname === '/admin/customers' ? 'bg-gray-100' : ''}
            >
              <IonIcon slot="start" icon={peopleOutline} />
              <IonLabel>Customers</IonLabel>
            </IonItem>
            <IonItem
              routerLink="/admin/account"
              routerDirection="none"
              detail={false}
              className={location.pathname === '/admin/account' ? 'bg-gray-100' : ''}
            >
              <IonIcon slot="start" icon={personOutline} />
              <IonLabel>Account</IonLabel>
            </IonItem>
            <IonItem
              routerLink="/admin/corporate"
              routerDirection="none"
              detail={false}
              className={location.pathname === '/admin/corporate' ? 'bg-gray-100' : ''}
            >
              <IonIcon slot="start" icon={businessOutline} />
              <IonLabel>Corporate</IonLabel>
            </IonItem>
            <IonItem
              routerLink="/admin/costing"
              routerDirection="none"
              detail={false}
              className={location.pathname === '/admin/costing' ? 'bg-gray-100' : ''}
            >
              <IonIcon slot="start" icon={cashOutline} />
              <IonLabel>Costing</IonLabel>
            </IonItem>
            <IonItem
              routerLink="/admin/monitor"
              routerDirection="none"
              detail={false}
              className={location.pathname === '/admin/monitor' ? 'bg-gray-100' : ''}
            >
              <IonIcon slot="start" icon={eyeOutline} />
              <IonLabel>Monitor</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default AdminMenu;