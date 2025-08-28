import React, { useEffect, useRef, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonMenuToggle,
  isPlatform,
} from '@ionic/react';
import {
  searchOutline,
  notificationsOutline,
  chevronDownOutline,
  ellipsisHorizontalOutline,
  homeOutline,
  cartOutline,
  peopleOutline,
  personOutline,
  businessOutline,
  cashOutline,
  eyeOutline,
  closeOutline,
  addCircleOutline,
  settingsOutline,
} from 'ionicons/icons';
import Chart from 'chart.js/auto';
import { useLocation, useHistory } from 'react-router-dom';

// Define types
interface Stat {
  count: number;
  increase: number;
  isPositive: boolean;
}

interface Order {
  id: number;
  name: string;
  date: string;
  amount: number;
  status: 'In Progress' | 'Complete' | 'Pending' | 'Shipping' | 'Rejected';
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'operating'>('users');
  const usersChartRef = useRef<HTMLCanvasElement | null>(null);
  const ordersChartRef = useRef<HTMLCanvasElement | null>(null);
  const operatingChartRef = useRef<HTMLCanvasElement | null>(null);
  const deviceChartRef = useRef<HTMLCanvasElement | null>(null);
  const locationChartRef = useRef<HTMLCanvasElement | null>(null);
  const productChartRef = useRef<HTMLCanvasElement | null>(null);
  const usersChartInstance = useRef<Chart | null>(null);
  const ordersChartInstance = useRef<Chart | null>(null);
  const operatingChartInstance = useRef<Chart | null>(null);
  const deviceChartInstance = useRef<Chart | null>(null);
  const locationChartInstance = useRef<Chart | null>(null);
  const productChartInstance = useRef<Chart | null>(null);
  const location = useLocation();
  const history = useHistory();

  // Determine platform
  const isPWA = isPlatform('pwa');
  const isMobile = isPlatform('mobile') && !isPlatform('tablet');

  const [stats] = useState<Record<string, Stat>>({
    views: { count: 7265, increase: 10.1, isPositive: true },
    visits: { count: 3671, increase: 0.03, isPositive: false },
    newUsers: { count: 256, increase: 15.03, isPositive: true },
    activeUsers: { count: 2318, increase: 6.08, isPositive: true },
  });

  const [orders] = useState<Order[]>([
    { id: 1, name: 'ByWind', date: 'Jun 24, 2025', amount: 942.0, status: 'In Progress' },
    { id: 2, name: 'Niall Craig', date: 'Mar 10, 2025', amount: 580.0, status: 'Complete' },
    { id: 3, name: 'Drew Cano', date: 'Nov 15, 2025', amount: 420.0, status: 'Pending' },
    { id: 4, name: 'Orlando Ridge', date: 'Dec 20, 2025', amount: 950.0, status: 'Shipping' },
    { id: 5, name: 'Ana Lane', date: 'Jul 23, 2025', amount: 820.0, status: 'Rejected' },
  ]);

  const getStatusColor = (status: Order['status']): string => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-600';
      case 'In Progress':
        return 'bg-purple-100 text-purple-600';
      case 'Pending':
        return 'bg-blue-100 text-blue-600';
      case 'Shipping':
        return 'bg-yellow-100 text-yellow-600';
      case 'Rejected':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  useEffect(() => {
    // Users Chart
    if (usersChartRef.current) {
      if (usersChartInstance.current) usersChartInstance.current.destroy();
      const ctx = usersChartRef.current.getContext('2d');
      if (ctx) {
        usersChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Users',
              data: [120, 90, 110, 160, 145, 170],
              borderColor: '#aa4bdc',
              backgroundColor: 'rgba(170, 75, 220, 0.2)',
              borderWidth: 2,
              pointRadius: 4,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: '#aa4bdc',
              pointBorderWidth: 2,
              tension: 0.4,
              fill: true,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { grid: { display: false } }, y: { grid: { color: '#f0f0f0' } } },
          },
        });
      }
    }

    // Orders Chart
    if (ordersChartRef.current) {
      if (ordersChartInstance.current) ordersChartInstance.current.destroy();
      const ctx = ordersChartRef.current.getContext('2d');
      if (ctx) {
        ordersChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Orders',
              data: [50, 70, 60, 90, 80, 100],
              backgroundColor: '#4b6bfb',
              borderRadius: 5,
              barThickness: 20,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { grid: { display: false } }, y: { grid: { color: '#f0f0f0' } } },
          },
        });
      }
    }

    // Operating Status Chart
    if (operatingChartRef.current) {
      if (operatingChartInstance.current) operatingChartInstance.current.destroy();
      const ctx = operatingChartRef.current.getContext('2d');
      if (ctx) {
        operatingChartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Operating Status',
              data: [95, 90, 92, 88, 93, 97],
              borderColor: '#aa4bdc',
              backgroundColor: 'rgba(170, 75, 220, 0.2)',
              borderWidth: 2,
              pointRadius: 4,
              pointBackgroundColor: '#ffffff',
              pointBorderColor: '#aa4bdc',
              pointBorderWidth: 2,
              tension: 0.4,
              fill: true,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { grid: { display: false } }, y: { grid: { color: '#f0f0f0' }, min: 88, max: 120 } },
          },
        });
      }
    }

    // Device Chart
    if (deviceChartRef.current) {
      if (deviceChartInstance.current) deviceChartInstance.current.destroy();
      const ctx = deviceChartRef.current.getContext('2d');
      if (ctx) {
        deviceChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Linux', 'Mac', 'iOS', 'Windows', 'Android', 'Other'],
            datasets: [{
              data: [15, 30, 20, 25, 243, 10],
              backgroundColor: ['#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#ff5f31', '#e0e0e0'],
              borderRadius: 5,
              barThickness: 20,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { grid: { display: false } }, y: { display: false } },
          },
        });
      }
    }

    // Location Chart
    if (locationChartRef.current) {
      if (locationChartInstance.current) locationChartInstance.current.destroy();
      const ctx = locationChartRef.current.getContext('2d');
      if (ctx) {
        locationChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['US', 'Canada', 'Mexico', 'China', 'Japan', 'Australia'],
            datasets: [{
              data: [25, 32, 18, 30, 28, 15],
              backgroundColor: '#e0e0e0',
              borderRadius: 5,
              barThickness: 20,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { grid: { display: false } }, y: { display: false } },
          },
        });
      }
    }

    // Product Chart
    if (productChartRef.current) {
      if (productChartInstance.current) productChartInstance.current.destroy();
      const ctx = productChartRef.current.getContext('2d');
      if (ctx) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const productData1 = months.map(() => Math.floor(Math.random() * 50) + 20);
        const productData2 = months.map(() => Math.floor(Math.random() * 40) + 10);
        productChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: months,
            datasets: [
              { data: productData1, backgroundColor: '#ff5f31', barThickness: 6 },
              { data: productData2, backgroundColor: '#666666', barThickness: 6 },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { grid: { display: false } }, y: { display: false } },
          },
        });
      }
    }

    return () => {
      [usersChartInstance, ordersChartInstance, operatingChartInstance, deviceChartInstance, locationChartInstance, productChartInstance].forEach(ref => {
        if (ref.current) ref.current.destroy();
      });
    };
  }, [activeTab]);

  return (
    <>
      <IonMenu contentId="main-content" menuId="main-menu" type="overlay" side="start" className="w-64 bg-white">
        <IonHeader className="border-b border-gray-200">
          <IonToolbar>
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center">
                <img src="/api/placeholder/40/40" alt="Logo" className="h-8 w-8 mr-2 rounded" />
                <span className="font-bold text-lg">Pocket Pujari</span>
              </div>
              <IonButtons>
                <IonMenuToggle>
                  <IonButton className="text-gray-600 hover:text-gray-900">
                    <IonIcon slot="icon-only" icon={closeOutline} />
                  </IonButton>
                </IonMenuToggle>
              </IonButtons>
            </div>
          </IonToolbar>
        </IonHeader>
        <IonContent className="">
          <IonList>
            <IonMenuToggle autoHide={true}>
              <IonItem
                button
                onClick={() => history.push('/admin/dashboard')}
                detail={false}
                className={location.pathname === '/admin/dashboard' ? 'bg-gray-100' : ''}
              >
                <IonIcon slot="start" icon={homeOutline} />
                <IonLabel>Overview</IonLabel>
              </IonItem>
              <IonItem
                button
                onClick={() => history.push('/admin/ecommerce')}
                detail={false}
                className={location.pathname === '/admin/ecommerce' ? 'bg-gray-100' : ''}
              >
                <IonIcon slot="start" icon={cartOutline} />
                <IonLabel>eCommerce</IonLabel>
              </IonItem>
              <IonItem
                button
                onClick={() => history.push('/admin/orders')}
                detail={false}
                className={location.pathname === '/admin/orders' ? 'bg-gray-100' : ''}
              >
                <IonIcon slot="start" icon={cartOutline} />
                <IonLabel>Orders</IonLabel>
              </IonItem>
              <IonItem
                button
                onClick={() => history.push('/admin/customers')}
                detail={false}
                className={location.pathname === '/admin/customers' ? 'bg-gray-100' : ''}
              >
                <IonIcon slot="start" icon={peopleOutline} />
                <IonLabel>Customers</IonLabel>
              </IonItem>
              <IonItem
                button
                onClick={() => history.push('/admin/createquiz')}
                detail={false}
                className={location.pathname === '/admin/createquiz' ? 'bg-gray-100' : ''}
              >
                <IonIcon slot="start" icon={addCircleOutline} />
                <IonLabel>Create Quiz</IonLabel>
              </IonItem>
              <IonItem
                button
                onClick={() => history.push('/admin/managequiz')}
                detail={false}
                className={location.pathname === '/admin/managequiz' ? 'bg-gray-100' : ''}
              >
                <IonIcon slot="start" icon={settingsOutline} />
                <IonLabel>Manage Quiz</IonLabel>
              </IonItem>
              <IonItem
                button
                onClick={() => history.push('/admin/account')}
                detail={false}
                className={location.pathname === '/admin/account' ? 'bg-gray-100' : ''}
              >
                <IonIcon slot="start" icon={personOutline} />
                <IonLabel>Account</IonLabel>
              </IonItem>
              <IonItem
                button
                onClick={() => history.push('/admin/corporate')}
                detail={false}
                className={location.pathname === '/admin/corporate' ? 'bg-gray-100' : ''}
              >
                <IonIcon slot="start" icon={businessOutline} />
                <IonLabel>Corporate</IonLabel>
              </IonItem>
              <IonItem
                button
                onClick={() => history.push('/admin/costing')}
                detail={false}
                className={location.pathname === '/admin/costing' ? 'bg-gray-100' : ''}
              >
                <IonIcon slot="start" icon={cashOutline} />
                <IonLabel>Costing</IonLabel>
              </IonItem>
              <IonItem
                button
                onClick={() => history.push('/admin/monitor')}
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

      <IonPage id="main-content">
        <IonHeader className="border-b border-gray-200">
          <IonToolbar>
            <IonButtons slot="start">
              {!isPWA && <IonMenuButton menu="main-menu" />}
            </IonButtons>
            <IonTitle size="large" className="flex-1 text-center text-xl font-semibold">
              Overview
            </IonTitle>
            <IonButtons slot="end" className="flex space-x-2">
              <IonButton className="text-gray-600 hover:text-gray-900">
                <IonIcon slot="icon-only" icon={searchOutline} />
              </IonButton>
              <IonButton className="text-gray-600 hover:text-gray-900">
                <IonIcon slot="icon-only" icon={notificationsOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen className="p-4 bg-gray-50">
          <div className="dashboard-container space-y-6 ml-0 sm:ml-0 md:ml-0 lg:ml-2">
            {/* Stat Cards */}
            <IonGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats).map(([key, { count, increase, isPositive }]) => (
                <IonCol key={key}>
                  <IonCard className="stat-card bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <IonCardContent className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-500 text-sm capitalize">{key}</span>
                        <span className={`trend-badge ${isPositive ? 'positive' : 'negative'}`}>
                          {isPositive ? '+' : '-'}{increase}%
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold">{count.toLocaleString()}</h3>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonGrid>

            {/* Users/Orders/Operating Status Chart */}
            <div className="chart-section bg-white rounded-lg shadow-md p-4">
              <div className="chart-header flex flex-col sm:flex-row justify-between items-center mb-4">
                <div className="flex flex-wrap space-x-2 mb-2 sm:mb-0">
                  <button
                    className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                  >
                    Users
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    Orders
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'operating' ? 'active' : ''}`}
                    onClick={() => setActiveTab('operating')}
                  >
                    Operating Status
                  </button>
                </div>
                <div className="flex items-center space-x-2 time-range-selector">
                  <span className="text-gray-600 text-sm">Week:</span>
                  <button className="time-selector-button flex items-center text-gray-600 hover:text-gray-900">
                    All time <IonIcon icon={chevronDownOutline} className="ml-1" />
                  </button>
                </div>
              </div>
              <div className="chart-container h-64">
                {activeTab === 'users' && <canvas ref={usersChartRef} />}
                {activeTab === 'orders' && <canvas ref={ordersChartRef} />}
                {activeTab === 'operating' && <canvas ref={operatingChartRef} />}
              </div>
            </div>

            {/* Device & Location Traffic */}
            <IonGrid className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <IonCol>
                <div className="traffic-card bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-medium">Device Traffic</h4>
                    <IonButton className="options-button">
                      <IonIcon icon={ellipsisHorizontalOutline} />
                    </IonButton>
                  </div>
                  <div className="chart-container h-40 relative">
                    <canvas ref={deviceChartRef} />
                    <div className="android-badge absolute top-1/2 right-4 transform -translate-y-1/2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full badge-value">
                      243K
                    </div>
                  </div>
                </div>
              </IonCol>
              <IonCol>
                <div className="traffic-card bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-medium">Location Traffic</h4>
                    <IonButton className="options-button">
                      <IonIcon icon={ellipsisHorizontalOutline} />
                    </IonButton>
                  </div>
                  <div className="chart-container h-40">
                    <canvas ref={locationChartRef} />
                  </div>
                </div>
              </IonCol>
            </IonGrid>

            {/* Product Traffic */}
            <div className="product-traffic-section bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-medium">Product Traffic</h4>
                <div className="flex space-x-2">
                  <button className="badge-button px-2 py-1 text-xs rounded-full">All</button>
                  <button className="badge-button px-2 py-1 text-xs rounded-full">SnowUI</button>
                  <button className="badge-button px-2 py-1 text-xs rounded-full">Dashboard</button>
                  <IonButton className="options-button">
                    <IonIcon icon={ellipsisHorizontalOutline} />
                  </IonButton>
                </div>
              </div>
              <div className="chart-container h-48">
                <canvas ref={productChartRef} />
              </div>
            </div>

            {/* Orders Table */}
            <div className="orders-section bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-medium">Orders</h4>
                <IonButton className="options-button">
                  <IonIcon icon={ellipsisHorizontalOutline} />
                </IonButton>
              </div>
              <div className="orders-table overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600">
                      <th className="p-2">Order Name</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t">
                        <td className="p-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs">{order.name.charAt(0)}</span>
                            </div>
                            {order.name}
                          </div>
                        </td>
                        <td className="p-2">{order.date}</td>
                        <td className="p-2">${order.amount.toFixed(2)}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Dashboard;