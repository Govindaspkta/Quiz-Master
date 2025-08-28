// import React, { useState } from 'react';
// import { 
//   IonPage, 
//   IonHeader, 
//   IonToolbar, 
//   IonTitle, 
//   IonContent,
//   IonButton,
//   IonIcon,
//   IonItem,
//   IonLabel,
//   IonSelect,
//   IonSelectOption,
//   IonSegment,
//   IonSegmentButton,
//   IonGrid,
//   IonRow,
//   IonCol,
//   IonCard,
//   IonCardContent
// } from '@ionic/react';
// import { arrowBack, download, calendar } from 'ionicons/icons';
// import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const AnalyticsPage = () => {
//   const [timeRange, setTimeRange] = useState('30');
//   const [chartView, setChartView] = useState('overview');
  
//   // Sample data for charts
//   const userActivityData = [
//     { name: 'Jan', users: 4000, quizzes: 2400 },
//     { name: 'Feb', users: 3000, quizzes: 1398 },
//     { name: 'Mar', users: 2000, quizzes: 9800 },
//     { name: 'Apr', users: 2780, quizzes: 3908 },
//     { name: 'May', users: 1890, quizzes: 4800 },
//     { name: 'Jun', users: 2390, quizzes: 3800 },
//     { name: 'Jul', users: 3490, quizzes: 4300 }
//   ];
  
//   const quizCategoryData = [
//     { name: 'Science', value: 35 },
//     { name: 'History', value: 25 },
//     { name: 'Mathematics', value: 20 },
//     { name: 'Literature', value: 15 },
//     { name: 'Geography', value: 5 }
//   ];
  
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
//   const scoreDistributionData = [
//     { name: '0-20', value: 5 },
//     { name: '21-40', value: 10 },
//     { name: '41-60', value: 25 },
//     { name: '61-80', value: 40 },
//     { name: '81-100', value: 20 }
//   ];
  
//   const topPerformingQuizzesData = [
//     { name: 'Quiz A', completions: 1200, avgScore: 85 },
//     { name: 'Quiz B', completions: 980, avgScore: 78 },
//     { name: 'Quiz C', completions: 860, avgScore: 92 },
//     { name: 'Quiz D', completions: 740, avgScore: 68 },
//     { name: 'Quiz E', completions: 690, avgScore: 76 }
//   ];
  
//   return (
//     <IonPage>
//       <IonHeader>
//         <IonToolbar className="bg-red-600 text-white">
//           <IonButton slot="start" fill="clear" color="light">
//             <IonIcon icon={arrowBack} />
//           </IonButton>
//           <IonTitle>Analytics Dashboard</IonTitle>
//           <IonButton slot="end" fill="clear" color="light">
//             <IonIcon icon={download} />
//           </IonButton>
//         </IonToolbar>
//       </IonHeader>
      
//       <IonContent className="bg-gray-50">
//         <div className="p-4">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-2xl font-bold">Analytics Overview</h1>
//               <p className="text-gray-500">Track quiz performance and user engagement</p>
//             </div>
            
//             <div className="flex items-center">
//               <IonIcon icon={calendar} className="mr-2 text-gray-500" />
//               <IonSelect 
//                 value={timeRange} 
//                 onIonChange={e => setTimeRange(e.detail.value)}
//                 interface="popover"
//                 className="bg-white shadow-sm rounded-md"
//               >
//                 <IonSelectOption value="7">Last 7 days</IonSelectOption>
//                 <IonSelectOption value="30">Last 30 days</IonSelectOption>
//                 <IonSelectOption value="90">Last 3 months</IonSelectOption>
//                 <IonSelectOption value="365">Last year</IonSelectOption>
//               </IonSelect>
//             </div>
//           </div>
          
//           {/* KPI Summary Cards */}
//           <div className="grid grid-cols-2 gap-4 mb-6">
//             <div className="bg-white p-4 rounded-lg shadow">
//               <div className="text-sm text-gray-500">Total Users</div>
//               <div className="text-2xl font-bold mt-1">12,458</div>
//               <div className="text-xs text-green-500 mt-1">+12% this month</div>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow">
//               <div className="text-sm text-gray-500">Total Quizzes</div>
//               <div className="text-2xl font-bold mt-1">245</div>
//               <div className="text-xs text-green-500 mt-1">+8% this month</div>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow">
//               <div className="text-sm text-gray-500">Completed Quizzes</div>
//               <div className="text-2xl font-bold mt-1">156,894</div>
//               <div className="text-xs text-green-500 mt-1">+15% this month</div>
//             </div>
//             <div className="bg-white p-4 rounded-lg shadow">
//               <div className="text-sm text-gray-500">Average Score</div>
//               <div className="text-2xl font-bold mt-1">76.5%</div>
//               <div className="text-xs text-red-500 mt-1">-2% this month</div>
//             </div>
//           </div>
          
//           {/* Chart View Selector */}
//           <IonSegment value={chartView} onIonChange={e => setChartView(e.detail.value)} className="mb-6 bg-white rounded-lg">
//             <IonSegmentButton value="overview">
//               <IonLabel>Overview</IonLabel>
//             </IonSegmentButton>
//             <IonSegmentButton value="users">
//               <IonLabel>Users</IonLabel>
//             </IonSegmentButton>
//             <IonSegmentButton value="quizzes">
//               <IonLabel>Quizzes</IonLabel>
//             </IonSegmentButton>
//             <IonSegmentButton value="scores">
//               <IonLabel>Scores</IonLabel>
//             </IonSegmentButton>
//           </IonSegment>
          
//           {/* Main Charts Section */}
//           {chartView === 'overview' && (
//             <>
//               <div className="bg-white rounded-lg shadow p-4 mb-6">
//                 <h2 className="text-lg font-medium mb-4">User & Quiz Activity</h2>
//                 <div className="h-64">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={userActivityData}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="name" />
//                       <YAxis />
//                       <Tooltip />
//                       <Legend />
//                       <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
//                       <Line type="monotone" dataKey="quizzes" stroke="#82ca9d" />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-2 gap-6 mb-6">
//                 <div className="bg-white rounded-lg shadow p-4">
//                   <h2 className="text-lg font-medium mb-4">Quiz Categories</h2>
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie
//                           data={quizCategoryData}
//                           cx="50%"
//                           cy="50%"
//                           labelLine={false}
//                           outerRadius={80}
//                           fill="#8884d8"
//                           dataKey="value"
//                           label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
//                         >
//                           {quizCategoryData.map((entry, index) => (
//                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                           ))}
//                         </Pie>
//                         <Tooltip />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>
                
//                 <div className="bg-white rounded-lg shadow p-4">
//                   <h2 className="text-lg font-medium mb-4">Score Distribution</h2>
//                   <div className="h-64">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <BarChart data={scoreDistributionData}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="name" />
//                         <YAxis />
//                         <Tooltip />
//                         <Bar dataKey="value" fill="#8884d8">
//                           {scoreDistributionData.map((entry, index) => (
//                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                           ))}
//                         </Bar>
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="bg-white rounded-lg shadow p-4 mb-6">
//                 <h2 className="text-lg font-medium mb-4">Top Performing Quizzes</h2>
//                 <div className="h-64">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart
//                       data={topPerformingQuizzesData}
//                       margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//                     >
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="name" />
//                       <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
//                       <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
//                       <Tooltip />
//                       <Legend />
//                       <Bar yAxisId="left" dataKey="completions" fill="#8884d8" />
//                       <Bar yAxisId="right" dataKey="avgScore" fill="#82ca9d" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             </>
//           )}
          
//           {/* Additional sections for other views, simplified for this example */}
//           {chartView !== 'overview' && (
//             <div className="bg-white rounded-lg shadow p-4 mb-6">
//               <h2 className="text-lg font-medium mb-4">
//                 {chartView === 'users' ? 'User Analytics' : 
//                  chartView === 'quizzes' ? 'Quiz Performance' : 'Score Analytics'}
//               </h2>
//               <div className="p-8 text-center text-gray-500">
//                 Detailed {chartView} analytics would be displayed here.
//               </div>
//             </div>
//           )}
          
//           {/* Recent Analytics Activity */}
//           <div className="bg-white rounded-lg shadow p-4">
//             <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
//             <IonGrid className="p-0">
//               <IonRow className="border-b border-gray-200 text-sm text-gray-500 py-2">
//                 <IonCol size="3">Date</IonCol>
//                 <IonCol size="4">Event</IonCol>
//                 <IonCol size="3">User</IonCol>
//                 <IonCol size="2">Value</IonCol>
//               </IonRow>
//               <IonRow className="border-b border-gray-200 py-3">
//                 <IonCol size="3" className="text-sm text-gray-500">Today, 10:30 AM</IonCol>
//                 <IonCol size="4">Quiz Completed</IonCol>
//                 <IonCol size="3">Alex Johnson</IonCol>
//                 <IonCol size="2" className="font-medium">85%</IonCol>
//               </IonRow>
//               <IonRow className="border-b border-gray-200 py-3">
//                 <IonCol size="3" className="text-sm text-gray-500">Today, 09:15 AM</IonCol>
//                 <IonCol size="4">New Quiz Created</IonCol>
//                 <IonCol size="3">Admin</IonCol>
//                 <IonCol size="2" className="font-medium">-</IonCol>
//               </IonRow>
//               <IonRow className="border-b border-gray-200 py-3">
//                 <IonCol size="3" className="text-sm text-gray-500">Yesterday, 4:20 PM</IonCol>
//                 <IonCol size="4">Quiz Updated</IonCol>
//                 <IonCol size="3">Admin</IonCol>
//                 <IonCol size="2" className="font-medium">-</IonCol>
//               </IonRow>
//               <IonRow className="py-3">
//                 <IonCol size="3" className="text-sm text-gray-500">Yesterday, 2:45 PM</IonCol>
//                 <IonCol size="4">Quiz Completed</IonCol>
//                 <IonCol size="3">Maria Garcia</IonCol>
//                 <IonCol size="2" className="font-medium">92%</IonCol>
//               </IonRow>
//             </IonGrid>
//           </div>
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default AnalyticsPage;