// import React, { useState } from 'react';
// import {
//   IonPage,
//   IonContent,
//   IonText,
//   IonCard,
//   IonCardContent,
//   IonIcon,
//   IonRippleEffect,
//   IonButton,
//   IonSearchbar,
//   IonChip,
//   IonBadge,
//   isPlatform,
//   IonGrid,
//   IonRow,
//   IonCol,
//   IonProgressBar
// } from '@ionic/react';
// import {
//   libraryOutline,
//   schoolOutline,
//   flaskOutline, // Changed from scienceOutline to flaskOutline
//   calculatorOutline,
//   languageOutline,
//   earthOutline,
//   colorPaletteOutline,
//   musicalNotesOutline,
//   trophyOutline,
//   timeOutline,
//   peopleOutline,
//   starOutline,
//   playOutline,
//   lockClosedOutline,
//   checkmarkCircleOutline,
//   flashOutline,
//   ribbonOutline
// } from 'ionicons/icons';

// interface QuizCategory {
//   id: number;
//   name: string;
//   description: string;
//   icon: string;
//   totalQuizzes: number;
//   completedQuizzes: number;
//   difficulty: 'Easy' | 'Medium' | 'Hard';
//   color: string;
//   isLocked: boolean;
//   bestScore: number | null;
// }

// interface FeaturedQuiz {
//   id: number;
//   title: string;
//   category: string;
//   questions: number;
//   duration: string;
//   difficulty: 'Easy' | 'Medium' | 'Hard';
//   participants: number;
//   rating: number;
//   isNew: boolean;
//   isTrending: boolean;
// }

// const Menu: React.FC = () => {
//   const [searchText, setSearchText] = useState('');
//   const [selectedDifficulty, setSelectedDifficulty] = useState('All');

//   // Platform-specific styles
//   const contentPadding = isPlatform('ios') ? '80px' : '70px';

//   // Mock quiz categories data
//   const quizCategories: QuizCategory[] = [
//     {
//       id: 1,
//       name: 'Mathematics',
//       description: 'Algebra, Geometry, Calculus & more',
//       icon: calculatorOutline,
//       totalQuizzes: 25,
//       completedQuizzes: 12,
//       difficulty: 'Medium',
//       color: '#4CAF50',
//       isLocked: false,
//       bestScore: 85
//     },
//     {
//       id: 2,
//       name: 'Science',
//       description: 'Physics, Chemistry, Biology',
//       icon: flaskOutline, // Updated icon reference
//       totalQuizzes: 30,
//       completedQuizzes: 8,
//       difficulty: 'Hard',
//       color: '#2196F3',
//       isLocked: false,
//       bestScore: 92
//     },
//     {
//       id: 3,
//       name: 'History',
//       description: 'World History, Ancient Civilizations',
//       icon: libraryOutline,
//       totalQuizzes: 20,
//       completedQuizzes: 15,
//       difficulty: 'Medium',
//       color: '#FF9800',
//       isLocked: false,
//       bestScore: 78
//     },
//     {
//       id: 4,
//       name: 'Geography',
//       description: 'Countries, Capitals, Landmarks',
//       icon: earthOutline,
//       totalQuizzes: 18,
//       completedQuizzes: 5,
//       difficulty: 'Easy',
//       color: '#8BC34A',
//       isLocked: false,
//       bestScore: 95
//     },
//     {
//       id: 5,
//       name: 'Literature',
//       description: 'Classic Books, Authors, Poetry',
//       icon: languageOutline,
//       totalQuizzes: 22,
//       completedQuizzes: 0,
//       difficulty: 'Hard',
//       color: '#9C27B0',
//       isLocked: false,
//       bestScore: null
//     },
//     {
//       id: 6,
//       name: 'Art & Culture',
//       description: 'Famous Paintings, Artists, Movements',
//       icon: colorPaletteOutline,
//       totalQuizzes: 15,
//       completedQuizzes: 0,
//       difficulty: 'Medium',
//       color: '#E91E63',
//       isLocked: true,
//       bestScore: null
//     }
//   ];

//   // Mock featured quizzes
//   const featuredQuizzes: FeaturedQuiz[] = [
//     {
//       id: 1,
//       title: 'Advanced Calculus Challenge',
//       category: 'Mathematics',
//       questions: 20,
//       duration: '30 min',
//       difficulty: 'Hard',
//       participants: 1247,
//       rating: 4.8,
//       isNew: false,
//       isTrending: true
//     },
//     {
//       id: 2,
//       title: 'World War II History',
//       category: 'History',
//       questions: 15,
//       duration: '20 min',
//       difficulty: 'Medium',
//       participants: 856,
//       rating: 4.6,
//       isNew: true,
//       isTrending: false
//     },
//     {
//       id: 3,
//       title: 'Periodic Table Master',
//       category: 'Science',
//       questions: 25,
//       duration: '25 min',
//       difficulty: 'Hard',
//       participants: 923,
//       rating: 4.9,
//       isNew: false,
//       isTrending: true
//     }
//   ];

//   const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

//   const filteredCategories = quizCategories.filter(category => {
//     const matchesSearch = category.name.toLowerCase().includes(searchText.toLowerCase()) ||
//                          category.description.toLowerCase().includes(searchText.toLowerCase());
//     const matchesDifficulty = selectedDifficulty === 'All' || category.difficulty === selectedDifficulty;
//     return matchesSearch && matchesDifficulty;
//   });

//   const getProgressPercentage = (completed: number, total: number) => {
//     return (completed / total) * 100;
//   };

//   const getDifficultyColor = (difficulty: string) => {
//     switch (difficulty) {
//       case 'Easy': return '#4CAF50';
//       case 'Medium': return '#FF9800';
//       case 'Hard': return '#F44336';
//       default: return 'var(--text-secondary)';
//     }
//   };

//   return (
//     <IonPage>
//       <IonContent 
//         className="scrollbar-hide" 
//         style={{ 
//           backgroundColor: 'var(--background)', 
//           '--padding-bottom': contentPadding 
//         }}
//       >
//         {/* Header */}
//         <div className="px-4 pt-6 pb-2">
//           <div className="flex justify-between items-center mb-4">
//             <div>
//               <IonText className="text-3xl font-bold text-[var(--text-primary)] block">
//                 Quiz Categories
//               </IonText>
//               <IonText className="text-sm text-[var(--text-secondary)]">
//                 Challenge your knowledge
//               </IonText>
//             </div>
//             {/* Stats Icon */}
//             <div className="flex items-center space-x-2">
//               <IonButton
//                 fill="clear"
//                 className="text-[var(--accent-gold)] p-2"
//                 style={{ '--color': 'var(--accent-gold)' }}
//               >
//                 <IonIcon icon={trophyOutline} className="text-2xl" />
//               </IonButton>
//             </div>
//           </div>

//           {/* Search Bar */}
//           <IonSearchbar
//             value={searchText}
//             onIonInput={(e) => setSearchText(e.detail.value!)}
//             placeholder="Search quiz categories..."
//             showClearButton="focus"
//             className="mb-4"
//             style={{
//               '--background': 'var(--background)',
//               '--color': 'var(--text-primary)',
//               '--placeholder-color': 'var(--text-secondary)',
//               '--icon-color': 'var(--accent-gold)',
//               '--clear-button-color': 'var(--accent-gold)',
//               '--border-radius': '12px',
//               '--box-shadow': '0 2px 8px rgba(204, 160, 0, 0.15)'
//             }}
//           />
//         </div>

//         {/* Difficulty Filter */}
//         <div className="px-4 mb-4">
//           <IonText className="text-lg font-semibold text-[var(--text-primary)] block mb-3">
//             Difficulty Level
//           </IonText>
//           <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
//             {difficulties.map((difficulty) => (
//               <IonChip
//                 key={difficulty}
//                 onClick={() => setSelectedDifficulty(difficulty)}
//                 className={`flex-shrink-0 px-4 py-2 cursor-pointer transition-all duration-200 ${
//                   selectedDifficulty === difficulty
//                     ? 'bg-[var(--accent-gold)] text-[var(--primary-dark)]'
//                     : 'bg-transparent text-[var(--text-secondary)] border border-[var(--accent-gold)]'
//                 }`}
//                 style={{
//                   '--background': selectedDifficulty === difficulty 
//                     ? 'var(--accent-gold)' 
//                     : 'transparent',
//                   '--color': selectedDifficulty === difficulty 
//                     ? 'var(--primary-dark)' 
//                     : 'var(--text-secondary)'
//                 }}
//               >
//                 {difficulty}
//               </IonChip>
//             ))}
//           </div>
//         </div>

//         {/* Featured Quizzes */}
//         <div className="px-4 mb-6">
//           <IonText className="text-lg font-semibold text-[var(--text-primary)] block mb-3">
//             🔥 Trending Quizzes
//           </IonText>
//           <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
//             {featuredQuizzes.map((quiz) => (
//               <IonCard 
//                 key={quiz.id}
//                 className="flex-shrink-0 w-72 ion-activatable relative overflow-hidden"
//                 style={{ 
//                   '--background': 'var(--background)',
//                   boxShadow: '0 2px 8px rgba(204, 160, 0, 0.15)',
//                   border: '1px solid rgba(204, 160, 0, 0.1)',
//                   borderRadius: '16px'
//                 }}
//               >
//                 <IonCardContent className="p-4">
//                   <div className="flex justify-between items-start mb-2">
//                     <IonText className="text-lg font-bold text-[var(--text-primary)] flex-1 pr-2">
//                       {quiz.title}
//                     </IonText>
//                     {quiz.isNew && (
//                       <IonChip 
//                         className="text-xs px-2 py-1"
//                         style={{
//                           backgroundColor: '#4CAF50',
//                           color: 'white',
//                           height: '20px'
//                         }}
//                       >
//                         New
//                       </IonChip>
//                     )}
//                     {quiz.isTrending && (
//                       <IonChip 
//                         className="text-xs px-2 py-1"
//                         style={{
//                           backgroundColor: 'var(--accent-gold)',
//                           color: 'var(--primary-dark)',
//                           height: '20px'
//                         }}
//                       >
//                         🔥 Hot
//                       </IonChip>
//                     )}
//                   </div>

//                   <IonText className="text-sm text-[var(--accent-gold)] block mb-2">
//                     {quiz.category}
//                   </IonText>

//                   <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] mb-3">
//                     <div className="flex items-center space-x-4">
//                       <div className="flex items-center space-x-1">
//                         <IonIcon icon={libraryOutline} />
//                         <span>{quiz.questions} questions</span>
//                       </div>
//                       <div className="flex items-center space-x-1">
//                         <IonIcon icon={timeOutline} />
//                         <span>{quiz.duration}</span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       <div className="flex items-center space-x-1">
//                         <IonIcon icon={starOutline} className="text-[var(--accent-gold)]" />
//                         <span className="text-sm font-medium text-[var(--text-primary)]">{quiz.rating}</span>
//                       </div>
//                       <div className="flex items-center space-x-1">
//                         <IonIcon icon={peopleOutline} className="text-[var(--text-secondary)]" />
//                         <span className="text-sm text-[var(--text-secondary)]">{quiz.participants}</span>
//                       </div>
//                     </div>

//                     <IonChip 
//                       className="text-xs px-2 py-1"
//                       style={{
//                         backgroundColor: getDifficultyColor(quiz.difficulty),
//                         color: 'white'
//                       }}
//                     >
//                       {quiz.difficulty}
//                     </IonChip>
//                   </div>
//                 </IonCardContent>
//                 <IonRippleEffect />
//               </IonCard>
//             ))}
//           </div>
//         </div>

//         {/* Quiz Categories */}
//         <div className="px-4 pb-4">
//           <div className="flex justify-between items-center mb-4">
//             <IonText className="text-lg font-semibold text-[var(--text-primary)]">
//               All Categories
//             </IonText>
//             <IonText className="text-sm text-[var(--text-secondary)]">
//               {filteredCategories.length} categories
//             </IonText>
//           </div>

//           <IonGrid className="p-0">
//             <IonRow>
//               {filteredCategories.map((category) => (
//                 <IonCol size="12" key={category.id}>
//                   <IonCard 
//                     className="m-0 mb-4 relative overflow-hidden ion-activatable"
//                     style={{ 
//                       '--background': 'var(--background)',
//                       boxShadow: '0 2px 8px rgba(204, 160, 0, 0.15)',
//                       border: '1px solid rgba(204, 160, 0, 0.1)',
//                       borderRadius: '16px',
//                       opacity: category.isLocked ? 0.6 : 1
//                     }}
//                   >
//                     <IonCardContent className="p-4">
//                       <div className="flex items-center space-x-4">
//                         {/* Category Icon */}
//                         <div 
//                           className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center relative"
//                           style={{ backgroundColor: `${category.color}20` }}
//                         >
//                           <IonIcon 
//                             icon={category.icon} 
//                             className="text-2xl"
//                             style={{ color: category.color }}
//                           />
//                           {category.isLocked && (
//                             <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
//                               <IonIcon icon={lockClosedOutline} className="text-white text-lg" />
//                             </div>
//                           )}
//                         </div>

//                         {/* Category Details */}
//                         <div className="flex-1 min-w-0">
//                           <div className="flex justify-between items-start mb-2">
//                             <div className="flex-1">
//                               <div className="flex items-center space-x-2 mb-1">
//                                 <IonText className="text-lg font-bold text-[var(--text-primary)] truncate">
//                                   {category.name}
//                                 </IonText>
//                                 <IonChip 
//                                   className="text-xs px-2 py-1"
//                                   style={{
//                                     backgroundColor: getDifficultyColor(category.difficulty),
//                                     color: 'white',
//                                     height: '20px'
//                                   }}
//                                 >
//                                   {category.difficulty}
//                                 </IonChip>
//                               </div>
                              
//                               <IonText className="text-sm text-[var(--text-secondary)] block mb-2">
//                                 {category.description}
//                               </IonText>

//                               <div className="flex items-center space-x-4 text-sm">
//                                 <div className="flex items-center space-x-1">
//                                   <IonIcon icon={libraryOutline} className="text-[var(--text-secondary)]" />
//                                   <span className="text-[var(--text-secondary)]">
//                                     {category.totalQuizzes} quizzes
//                                   </span>
//                                 </div>
                                
//                                 {category.bestScore && (
//                                   <div className="flex items-center space-x-1">
//                                     <IonIcon icon={trophyOutline} className="text-[var(--accent-gold)]" />
//                                     <span className="text-[var(--accent-gold)] font-medium">
//                                       Best: {category.bestScore}%
//                                     </span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>

//                             {!category.isLocked && (
//                               <IonButton
//                                 size="small"
//                                 className="font-medium"
//                                 style={{
//                                   '--background': 'var(--accent-gold)',
//                                   '--color': 'var(--primary-dark)',
//                                   '--border-radius': '20px',
//                                   '--padding-start': '16px',
//                                   '--padding-end': '16px'
//                                 }}
//                               >
//                                 <IonIcon icon={playOutline} slot="start" />
//                                 Start
//                               </IonButton>
//                             )}
//                           </div>

//                           {/* Progress Bar */}
//                           {!category.isLocked && category.completedQuizzes > 0 && (
//                             <div className="mt-3">
//                               <div className="flex justify-between items-center mb-1">
//                                 <IonText className="text-xs text-[var(--text-secondary)]">
//                                   Progress
//                                 </IonText>
//                                 <IonText className="text-xs font-medium text-[var(--text-primary)]">
//                                   {category.completedQuizzes}/{category.totalQuizzes}
//                                 </IonText>
//                               </div>
//                               <IonProgressBar
//                                 value={getProgressPercentage(category.completedQuizzes, category.totalQuizzes) / 100}
//                                 style={{
//                                   '--progress-background': 'var(--accent-gold)',
//                                   '--background': 'rgba(204, 160, 0, 0.2)',
//                                   height: '6px',
//                                   borderRadius: '3px'
//                                 }}
//                               />
//                             </div>
//                           )}

//                           {category.isLocked && (
//                             <div className="mt-2 flex items-center space-x-2">
//                               <IonIcon icon={lockClosedOutline} className="text-[var(--text-secondary)] text-sm" />
//                               <IonText className="text-sm text-[var(--text-secondary)]">
//                                 Complete more quizzes to unlock
//                               </IonText>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </IonCardContent>
//                     <IonRippleEffect />
//                   </IonCard>
//                 </IonCol>
//               ))}
//             </IonRow>
//           </IonGrid>

//           {filteredCategories.length === 0 && (
//             <div className="text-center py-12">
//               <IonText className="text-[var(--text-secondary)] text-lg">
//                 No categories found matching your search
//               </IonText>
//             </div>
//           )}
//         </div>

//         {/* Quick Stats Card */}
//         <div className="px-4 pb-6">
//           <IonCard 
//             className="ion-activatable"
//             style={{ 
//               '--background': 'linear-gradient(135deg, var(--accent-gold), var(--accent-yellow))',
//               borderRadius: '16px',
//               overflow: 'hidden'
//             }}
//           >
//             <IonCardContent className="p-4">
//               <div className="flex justify-between items-center text-[var(--primary-dark)]">
//                 <div>
//                   <IonText className="text-2xl font-bold block">
//                     Your Stats
//                   </IonText>
//                   <IonText className="text-sm opacity-80">
//                     Keep up the great work!
//                   </IonText>
//                 </div>
//                 <div className="text-right">
//                   <div className="flex items-center space-x-4">
//                     <div className="text-center">
//                       <IonText className="text-2xl font-bold block">40</IonText>
//                       <IonText className="text-xs opacity-80">Completed</IonText>
//                     </div>
//                     <div className="text-center">
//                       <IonText className="text-2xl font-bold block">87%</IonText>
//                       <IonText className="text-xs opacity-80">Avg Score</IonText>
//                     </div>
//                     <div className="text-center">
//                       <IonText className="text-2xl font-bold block">#12</IonText>
//                       <IonText className="text-xs opacity-80">Rank</IonText>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </IonCardContent>
//             <IonRippleEffect />
//           </IonCard>
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default Menu;