import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonAlert,
  IonButtons,
  IonBackButton,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSkeletonText,
  IonFab,
  IonFabButton,
  IonListHeader,
} from '@ionic/react';
import {
  pencilOutline,
  trashOutline,
  saveOutline,
  closeOutline,
  arrowBackOutline,
  addOutline,
  refreshOutline,
  statsChartOutline,
} from 'ionicons/icons';
import api from '../../utils/api';
import { useHistory } from 'react-router-dom';
import { RefresherEventDetail } from '@ionic/core';

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Option {
  id: number;
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id: number | null;
  question: string;
  type: string;
  options: Option[];
  answer: string;
  explanation: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  category: Category;
  category_id: number;
  difficulty: string;
  is_public: boolean;
  questions: Question[];
}

const ManageQuizzes: React.FC = () => {
  const history = useHistory();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [editedDescription, setEditedDescription] = useState<string>('');
  const [editedCategory, setEditedCategory] = useState<number | null>(null);
  const [editedDifficulty, setEditedDifficulty] = useState<string>('');
  const [editedIsPublic, setEditedIsPublic] = useState<boolean>(true);
  const [editedQuestions, setEditedQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [quizzesResponse, categoriesResponse] = await Promise.all([
        api.get('/api/quizzes?include_questions=true'),
        api.get('/api/categories'),
      ]);
      const updatedQuizzes: Quiz[] = quizzesResponse.data.map((quiz: any) => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description || '',
        category: quiz.category,
        category_id: quiz.category.id,
        difficulty: quiz.difficulty || 'medium',
        is_public: quiz.is_active !== undefined ? quiz.is_active : quiz.is_public,
        questions: quiz.questions.map((q: any) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        })),
      }));
      setQuizzes(updatedQuizzes);
      setFilteredQuizzes(updatedQuizzes);
      setCategories(categoriesResponse.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setToastMessage('Failed to load quizzes or categories');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredQuizzes(quizzes);
    } else {
      const filtered = quizzes.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchText.toLowerCase()) ||
          (quiz.description && quiz.description.toLowerCase().includes(searchText.toLowerCase())) ||
          (quiz.difficulty && quiz.difficulty.toLowerCase().includes(searchText.toLowerCase())) ||
          quiz.category.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    }
  }, [searchText, quizzes]);

  const handleEdit = (quiz: Quiz) => {
    if (!quiz.category.id) {
      setToastMessage('Cannot edit quizzes without a category');
      setShowToast(true);
      return;
    }
    setSelectedQuiz(quiz);
    setEditedTitle(quiz.title);
    setEditedDescription(quiz.description || '');
    setEditedCategory(quiz.category.id || null);
    setEditedDifficulty(quiz.difficulty || 'medium');
    setEditedIsPublic(quiz.is_public || true);
    setEditedQuestions(
      quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options.map((opt) => ({
          id: opt.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        })),
        answer: q.answer,
        explanation: q.explanation,
      }))
    );
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedQuiz || !editedTitle || editedCategory === null || !editedDifficulty || !editedQuestions.length) {
      setToastMessage('Please fill all required fields and include at least one question');
      setShowToast(true);
      return;
    }

    for (const q of editedQuestions) {
      if (!q.question || !q.answer || (q.type === 'multiple_choice' && (!q.options || q.options.length < 2))) {
        setToastMessage('All questions must have text, an answer, and at least two options for multiple-choice');
        setShowToast(true);
        return;
      }
      if (q.type === 'multiple_choice' && !q.options.some((opt) => opt.option_text === q.answer)) {
        setToastMessage('The answer must be one of the options for multiple-choice questions');
        setShowToast(true);
        return;
      }
    }

    try {
      await api.put(`/api/quizzes/${selectedQuiz.id}`, {
        title: editedTitle,
        category_id: editedCategory,
        difficulty: editedDifficulty,
        description: editedDescription,
        time_limit: null,
        is_public: editedIsPublic,
        questions: editedQuestions.map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options.map((opt) => opt.option_text),
          answer: q.answer,
          explanation: q.explanation,
        })),
      });

      const updatedQuizzes = quizzes.map((q) =>
        q.id === selectedQuiz.id
          ? {
              ...q,
              title: editedTitle,
              description: editedDescription,
              category_id: editedCategory,
              category: {
                id: editedCategory,
                name: categories.find((c) => c.id === editedCategory)?.name || 'Unknown',
                icon: categories.find((c) => c.id === editedCategory)?.icon || '❓',
              },
              difficulty: editedDifficulty,
              is_public: editedIsPublic,
              questions: editedQuestions.map((q, qIdx) => ({
                id: q.id || qIdx + 1,
                question: q.question,
                type: q.type,
                options: q.options.map((opt: Option, idx: number) => ({
                  id: opt.id || idx + 1,
                  option_text: opt.option_text,
                  is_correct: opt.option_text === q.answer,
                })),
                answer: q.answer,
                explanation: q.explanation,
              })),
            }
          : q
      );

      setQuizzes(updatedQuizzes);
      setFilteredQuizzes(updatedQuizzes);
      setToastMessage('Quiz updated successfully');
      setShowToast(true);
      setShowEditModal(false);
    } catch (error: any) {
      console.error('Error updating quiz:', error);
      setToastMessage(error.response?.data?.message || 'Failed to update quiz');
      setShowToast(true);
    }
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;

    try {
      await api.delete(`/api/quizzes/${quizToDelete}`);
      await fetchData();
      setToastMessage('Quiz deleted successfully');
      setShowToast(true);
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      setToastMessage(error.response?.data?.message || 'Failed to delete quiz');
      setShowToast(true);
    } finally {
      setShowDeleteConfirm(false);
      setQuizToDelete(null);
    }
  };

  const handleAddQuestion = () => {
    setEditedQuestions([
      ...editedQuestions,
      {
        id: null,
        question: '',
        type: 'multiple_choice',
        options: [
          { id: 1, option_text: '', is_correct: false },
          { id: 2, option_text: '', is_correct: false },
          { id: 3, option_text: '', is_correct: false },
          { id: 4, option_text: '', is_correct: false },
        ],
        answer: '',
        explanation: '',
      },
    ]);
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: string | Option[]) => {
    const updatedQuestions = [...editedQuestions];
    if (field === 'options' && Array.isArray(value)) {
      updatedQuestions[index].options = value as Option[];
    } else if (typeof value === 'string') {
      updatedQuestions[index][field] = value as never; // Type assertion to bypass strict type checking
    }
    setEditedQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updatedQuestions = [...editedQuestions];
    updatedQuestions[qIndex].options[optIndex].option_text = value;
    setEditedQuestions(updatedQuestions);
  };

  const handleAddOption = (qIndex: number) => {
    const updatedQuestions = [...editedQuestions];
    const newOptionId = updatedQuestions[qIndex].options.length + 1;
    updatedQuestions[qIndex].options.push({
      id: newOptionId,
      option_text: '',
      is_correct: false,
    });
    setEditedQuestions(updatedQuestions);
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    const updatedQuestions = [...editedQuestions];
    if (updatedQuestions[qIndex].options.length > 2) {
      updatedQuestions[qIndex].options.splice(optIndex, 1);
      updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.map((opt, idx) => ({
        ...opt,
        id: idx + 1,
      }));
      setEditedQuestions(updatedQuestions);
    } else {
      setToastMessage('Multiple-choice questions must have at least two options');
      setShowToast(true);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setEditedQuestions(editedQuestions.filter((_, i) => i !== index));
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchData();
    event.detail.complete();
  };

  const handleViewQuizStats = (quizId: number) => {
    history.push(`/admin/quizzes/${quizId}/stats`);
  };

  const renderQuizList = () => {
    if (isLoading) {
      return Array(3)
        .fill(0)
        .map((_, index) => (
          <IonCard key={`skeleton-${index}`}>
            <IonCardHeader>
              <IonSkeletonText animated style={{ width: '70%' }} />
            </IonCardHeader>
            <IonCardContent>
              <IonSkeletonText animated style={{ width: '90%' }} />
              <IonSkeletonText animated style={{ width: '40%' }} />
            </IonCardContent>
          </IonCard>
        ));
    }

    if (filteredQuizzes.length === 0) {
      return (
        <IonCard>
          <IonCardContent className="ion-text-center">
            <p>No quizzes found. Create your first quiz!</p>
            <IonButton color="primary" onClick={() => history.push('/admin/createQuiz')}>
              Create New Quiz
            </IonButton>
          </IonCardContent>
        </IonCard>
      );
    }

    return (
      <IonList>
        {filteredQuizzes.map((quiz) => (
          <IonItemSliding key={quiz.id}>
            <IonItem lines="full">
              <div className="ion-padding-vertical ion-margin-end">
                <IonBadge color="tertiary">{quiz.category.name}</IonBadge>
                <IonBadge color={quiz.is_public ? 'success' : 'danger'} className="ion-margin-start">
                  {quiz.is_public ? 'Active' : 'Inactive'}
                </IonBadge>
              </div>
              <IonLabel>
                <h2>{quiz.title}</h2>
                <p>{quiz.description || 'No description'}</p>
                <p className="ion-text-sm ion-text-muted">
                  Difficulty: {quiz.difficulty || 'Medium'} | Questions: {quiz.questions.length || 0}
                </p>
                {quiz.questions.length > 0 && (
                  <div className="ion-margin-top">
                    <IonListHeader>Questions</IonListHeader>
                    <IonList>
                      {quiz.questions.map((q: Question, index: number) => (
                        <IonItem key={q.id || `temp-${index}`}>
                          <IonLabel>
                            <h3>
                              {index + 1}. {q.question}
                            </h3>
                            {q.options.length > 0 && (
                              <ul>
                                {q.options.map((opt: Option, optIndex: number) => (
                                  <li key={opt.id} style={{ color: opt.is_correct ? 'green' : 'inherit' }}>
                                    {optIndex + 1}. {opt.option_text}
                                    {opt.is_correct && ' (Correct)'}
                                  </li>
                                ))}
                              </ul>
                            )}
                            <p>Explanation: {q.explanation || 'None'}</p>
                          </IonLabel>
                        </IonItem>
                      ))}
                    </IonList>
                  </div>
                )}
              </IonLabel>
            </IonItem>

            <IonItemOptions side="end">
              <IonItemOption
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(quiz);
                }}
              >
                <IonIcon slot="icon-only" icon={pencilOutline} />
              </IonItemOption>
              <IonItemOption
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewQuizStats(quiz.id);
                }}
              >
                <IonIcon slot="icon-only" icon={statsChartOutline} />
              </IonItemOption>
              <IonItemOption
                color="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuizToDelete(quiz.id);
                  setShowDeleteConfirm(true);
                }}
              >
                <IonIcon slot="icon-only" icon={trashOutline} />
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        ))}
      </IonList>
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/dashboard" icon={arrowBackOutline} text="Back" />
          </IonButtons>
          <IonTitle>Manage Quizzes</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={fetchData}>
              <IonIcon slot="icon-only" icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding">
          <IonSearchbar
            value={searchText}
            onIonChange={(e) => setSearchText(e.detail.value!)}
            placeholder="Search quizzes..."
            animated
            showCancelButton="focus"
          />

          <IonGrid>
            <IonRow>
              <IonCol>
                <div className="stats-container ion-padding ion-margin-bottom">
                  <IonCard color="light">
                    <IonCardContent className="ion-text-center">
                      <h2>Total Quizzes</h2>
                      <p className="ion-text-large">{quizzes.length}</p>
                    </IonCardContent>
                  </IonCard>
                </div>
              </IonCol>
              <IonCol>
                <div className="stats-container ion-padding ion-margin-bottom">
                  <IonCard color="light">
                    <IonCardContent className="ion-text-center">
                      <h2>Categories</h2>
                      <p className="ion-text-large">{categories.length}</p>
                    </IonCardContent>
                  </IonCard>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>

          {renderQuizList()}
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/admin/createQuiz')}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Edit Quiz</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowEditModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Title</IonLabel>
              <IonInput
                value={editedTitle}
                onIonChange={(e) => setEditedTitle(e.detail.value || '')}
                placeholder="Enter quiz title"
                required
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Description</IonLabel>
              <IonTextarea
                value={editedDescription}
                onIonChange={(e) => setEditedDescription(e.detail.value || '')}
                placeholder="Enter description"
                rows={4}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Category</IonLabel>
              <IonSelect
                value={editedCategory}
                onIonChange={(e) => setEditedCategory(e.detail.value)}
                placeholder="Select a category"
                interface="action-sheet"
                cancelText="Cancel"
              >
                {categories.map((category) => (
                  <IonSelectOption key={category.id} value={category.id}>
                    {category.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Difficulty</IonLabel>
              <IonSelect
                value={editedDifficulty}
                onIonChange={(e) => setEditedDifficulty(e.detail.value)}
                placeholder="Select a difficulty"
                interface="action-sheet"
                cancelText="Cancel"
              >
                <IonSelectOption value="easy">Easy</IonSelectOption>
                <IonSelectOption value="medium">Medium</IonSelectOption>
                <IonSelectOption value="hard">Hard</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Status</IonLabel>
              <IonSelect
                value={editedIsPublic}
                onIonChange={(e) => setEditedIsPublic(e.detail.value)}
                placeholder="Select a status"
                interface="action-sheet"
                cancelText="Cancel"
              >
                <IonSelectOption value={true}>Public</IonSelectOption>
                <IonSelectOption value={false}>Private</IonSelectOption>
              </IonSelect>
            </IonItem>
            <IonListHeader>Questions</IonListHeader>
            <IonList>
              {editedQuestions.map((question, qIndex) => (
                <IonItem key={question.id || `temp-${qIndex}`}>
                  <IonLabel position="stacked">Question {qIndex + 1}</IonLabel>
                  <IonInput
                    value={question.question}
                    onIonChange={(e) => handleQuestionChange(qIndex, 'question', e.detail.value || '')}
                    placeholder="Enter question text"
                  />
                  <IonLabel position="stacked">Type</IonLabel>
                  <IonSelect
                    value={question.type}
                    onIonChange={(e) => handleQuestionChange(qIndex, 'type', e.detail.value)}
                    interface="action-sheet"
                    cancelText="Cancel"
                  >
                    <IonSelectOption value="multiple_choice">Multiple Choice</IonSelectOption>
                    <IonSelectOption value="true_false">True/False</IonSelectOption>
                    <IonSelectOption value="multiple_answer">Multiple Answer</IonSelectOption>
                    <IonSelectOption value="short_answer">Short Answer</IonSelectOption>
                  </IonSelect>
                  {question.type === 'multiple_choice' && (
                    <>
                      <IonLabel position="stacked">Options</IonLabel>
                      {question.options.map((opt: Option, optIndex: number) => (
                        <IonItem key={opt.id || `opt-${optIndex}`}>
                          <IonInput
                            value={opt.option_text}
                            onIonChange={(e) => handleOptionChange(qIndex, optIndex, e.detail.value || '')}
                            placeholder={`Option ${optIndex + 1}`}
                          />
                          {question.options.length > 2 && (
                            <IonButton
                              color="danger"
                              size="small"
                              onClick={() => handleRemoveOption(qIndex, optIndex)}
                            >
                              Remove
                            </IonButton>
                          )}
                        </IonItem>
                      ))}
                      <IonButton
                        color="secondary"
                        size="small"
                        onClick={() => handleAddOption(qIndex)}
                      >
                        Add Option
                      </IonButton>
                      <IonLabel position="stacked">Correct Answer</IonLabel>
                      <IonSelect
                        value={question.answer}
                        onIonChange={(e) => handleQuestionChange(qIndex, 'answer', e.detail.value)}
                        interface="action-sheet"
                        cancelText="Cancel"
                      >
                        {question.options.map((opt: Option, optIndex: number) => (
                          <IonSelectOption key={opt.id || `opt-${optIndex}`} value={opt.option_text}>
                            {opt.option_text || `Option ${optIndex + 1}`}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </>
                  )}
                  <IonLabel position="stacked">Explanation</IonLabel>
                  <IonTextarea
                    value={question.explanation}
                    onIonChange={(e) => handleQuestionChange(qIndex, 'explanation', e.detail.value || '')}
                    placeholder="Enter explanation"
                    rows={3}
                  />
                  <IonButton
                    color="danger"
                    size="small"
                    onClick={() => handleRemoveQuestion(qIndex)}
                  >
                    Delete Question
                  </IonButton>
                </IonItem>
              ))}
              <IonButton color="secondary" expand="block" onClick={handleAddQuestion}>
                Add Question
              </IonButton>
            </IonList>
            <div className="ion-padding">
              <IonButton expand="block" color="primary" onClick={handleUpdate}>
                <IonIcon slot="start" icon={saveOutline} />
                Save Changes
              </IonButton>
              <IonButton
                expand="block"
                color="medium"
                onClick={() => setShowEditModal(false)}
                className="ion-margin-top"
              >
                Cancel
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showDeleteConfirm}
          onDidDismiss={() => setShowDeleteConfirm(false)}
          header="Confirm Delete"
          message="Are you sure you want to delete this quiz? This action cannot be undone."
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              cssClass: 'danger',
              handler: handleDelete,
            },
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color="dark"
        />
      </IonContent>
    </IonPage>
  );
};

export default ManageQuizzes;