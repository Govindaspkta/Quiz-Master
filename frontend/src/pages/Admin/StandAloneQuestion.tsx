import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonInput,
  IonButton,
  IonText,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonAlert,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonIcon,
  IonModal,
  IonBadge,
  useIonToast,
  useIonLoading,
} from '@ionic/react';
import { 
  pencilOutline, 
  trashOutline, 
  saveOutline, 
  closeOutline,
  refreshOutline,
  checkmarkCircleOutline,
  closeCircleOutline
} from 'ionicons/icons';
import api from '../../utils/api';
import BackButton from '../../components/BackButton';

interface StandaloneQuestion {
  id: number;
  question: string;
  question_type: string;
  options: string[] | { A: string; B: string; C: string; D: string };
  answer: string;
  explanation: string;
}

interface EditQuestionData {
  question: string;
  question_type: string;
  options: { A: string; B: string; C: string; D: string };
  answer: string;
  explanation: string;
}

const StandaloneQuestionsCRUD: React.FC = () => {
  const [questions, setQuestions] = useState<StandaloneQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<EditQuestionData>({
    question: '',
    question_type: 'multiple_choice',
    options: { A: '', B: '', C: '', D: '' },
    answer: '',
    explanation: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteAlert, setDeleteAlert] = useState<{
    isOpen: boolean;
    questionId: number | null;
    questionText: string;
  }>({
    isOpen: false,
    questionId: null,
    questionText: ''
  });
  
  const [present] = useIonToast();
  const [presentLoading, dismissLoading] = useIonLoading();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/standalone-questions');
      setQuestions(response.data);
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      present({
        message: error.response?.data?.error || 'Failed to load questions',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await fetchQuestions();
    event.detail.complete();
  };

  const formatOptionsFromQuestion = (options: string[] | { A: string; B: string; C: string; D: string }): { A: string; B: string; C: string; D: string } => {
    const defaultOptions = { A: '', B: '', C: '', D: '' };
    
    if (!options) return defaultOptions;
    
    if (Array.isArray(options)) {
      return {
        A: options[0] || '',
        B: options[1] || '',
        C: options[2] || '',
        D: options[3] || ''
      };
    } else if (typeof options === 'object') {
      return { ...defaultOptions, ...options };
    }
    
    return defaultOptions;
  };

  const openEditModal = (question: StandaloneQuestion) => {
    try {
      const formattedOptions = formatOptionsFromQuestion(question.options);
      
      // Handle true/false questions specially
      let finalOptions = formattedOptions;
      if (question.question_type === 'true_false') {
        finalOptions = { A: 'True', B: 'False', C: '', D: '' };
      }
      
      setCurrentQuestion({
        question: question.question || '',
        question_type: question.question_type || 'multiple_choice',
        options: finalOptions,
        answer: question.answer || '',
        explanation: question.explanation || '',
      });
      
      setEditingId(question.id);
      setEditModal(true);
      setErrors({});
      
      console.log('Opening edit modal for question:', question.id, 'with data:', {
        question: question.question,
        question_type: question.question_type,
        options: finalOptions,
        answer: question.answer
      });
      
    } catch (error: any) {
      console.error('Error preparing question for edit:', error);
      present({
        message: 'Failed to open question for editing',
        duration: 2000,
        color: 'danger',
      });
    }
  };

  const closeEditModal = () => {
    setEditModal(false);
    setCurrentQuestion({
      question: '',
      question_type: 'multiple_choice',
      options: { A: '', B: '', C: '', D: '' },
      answer: '',
      explanation: '',
    });
    setEditingId(null);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!currentQuestion.question.trim()) {
      newErrors.question = 'Question text is required';
    }
    
    if (!currentQuestion.answer.trim()) {
      newErrors.answer = 'Answer is required';
    }
    
    if (currentQuestion.question_type === 'multiple_choice') {
      const optionValues = Object.values(currentQuestion.options).filter(opt => opt.trim() !== '');
      if (optionValues.length < 2) {
        newErrors.options = 'At least 2 options are required for multiple choice questions';
      }
      
      if (currentQuestion.answer && !Object.values(currentQuestion.options).includes(currentQuestion.answer)) {
        newErrors.answer = 'Answer must match one of the provided options';
      }
    }
    
    if (currentQuestion.question_type === 'true_false') {
      if (!['True', 'False'].includes(currentQuestion.answer)) {
        newErrors.answer = 'Answer must be "True" or "False" for true/false questions';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm() || !editingId) {
      present({
        message: 'Please fix the errors before saving',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    try {
      setSaving(true);
      await presentLoading({ message: 'Updating question...' });
      
      let optionsToSend = {};
      if (currentQuestion.question_type === 'multiple_choice') {
        optionsToSend = currentQuestion.options;
      } else if (currentQuestion.question_type === 'true_false') {
        optionsToSend = { A: 'True', B: 'False', C: '', D: '' };
      }
      
      const updateData = {
        question: currentQuestion.question.trim(),
        question_type: currentQuestion.question_type,
        answer: currentQuestion.answer.trim(),
        explanation: currentQuestion.explanation.trim(),
        options: optionsToSend
      };
      
      console.log('Sending update data:', updateData);
      
      await api.put(`/api/standalone-questions/${editingId}`, updateData);
      
      // Refresh the questions list
      await fetchQuestions();
      
      present({
        message: 'Question updated successfully',
        duration: 2000,
        color: 'success',
      });
      
      closeEditModal();
    } catch (error: any) {
      console.error('Error updating question:', error);
      present({
        message: error.response?.data?.error || 'Failed to update question',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setSaving(false);
      await dismissLoading();
    }
  };

  const confirmDelete = (question: StandaloneQuestion) => {
    setDeleteAlert({
      isOpen: true,
      questionId: question.id,
      questionText: question.question.substring(0, 100) + (question.question.length > 100 ? '...' : '')
    });
  };

  const handleDelete = async () => {
    if (!deleteAlert.questionId) return;
    
    try {
      await presentLoading({ message: 'Deleting question...' });
      
      await api.delete(`/api/standalone-questions/${deleteAlert.questionId}`);
      
      setQuestions(prev => prev.filter(q => q.id !== deleteAlert.questionId));
      
      present({
        message: 'Question deleted successfully',
        duration: 2000,
        color: 'success',
      });
    } catch (error: any) {
      console.error('Error deleting question:', error);
      present({
        message: error.response?.data?.error || 'Failed to delete question',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      await dismissLoading();
      setDeleteAlert({ isOpen: false, questionId: null, questionText: '' });
    }
  };

  const handleOptionChange = (optionKey: 'A' | 'B' | 'C' | 'D', value: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [optionKey]: value
      }
    }));
    
    // Clear options error if it exists
    if (errors.options) {
      setErrors(prev => ({ ...prev, options: '' }));
    }
  };

  const handleAnswerChange = (value: string) => {
    setCurrentQuestion(prev => ({ ...prev, answer: value }));
    if (errors.answer) {
      setErrors(prev => ({ ...prev, answer: '' }));
    }
  };

  const handleQuestionChange = (value: string) => {
    setCurrentQuestion(prev => ({ ...prev, question: value }));
    if (errors.question) {
      setErrors(prev => ({ ...prev, question: '' }));
    }
  };

  const handleQuestionTypeChange = (type: string) => {
    let newAnswer = '';
    let newOptions = { A: '', B: '', C: '', D: '' };
    
    if (type === 'true_false') {
      newOptions = { A: 'True', B: 'False', C: '', D: '' };
      // Keep existing answer if it's True or False
      newAnswer = (currentQuestion.answer === 'True' || currentQuestion.answer === 'False') 
        ? currentQuestion.answer 
        : '';
    } else if (type === 'multiple_choice') {
      // Keep existing options and answer if switching back to multiple choice
      newOptions = currentQuestion.options;
      newAnswer = currentQuestion.answer;
    } else if (type === 'short_answer') {
      // For short answer, no options needed
      newOptions = { A: '', B: '', C: '', D: '' };
      newAnswer = currentQuestion.answer;
    }
    
    setCurrentQuestion(prev => ({
      ...prev,
      question_type: type,
      options: newOptions,
      answer: newAnswer
    }));
    
    // Clear all errors when changing type
    setErrors({});
  };

  const formatDisplayOptions = (options: string[] | { A: string; B: string; C: string; D: string }): string[] => {
    if (Array.isArray(options)) {
      return options.filter(opt => opt && opt.trim() !== '');
    } else if (options && typeof options === 'object') {
      return [options.A, options.B, options.C, options.D].filter(opt => opt && opt.trim() !== '');
    }
    return [];
  };

  const getQuestionTypeDisplay = (type: string): string => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      case 'short_answer':
        return 'Short Answer';
      default:
        return type;
    }
  };

  const getQuestionTypeColor = (type: string): string => {
    switch (type) {
      case 'multiple_choice':
        return 'primary';
      case 'true_false':
        return 'secondary';
      case 'short_answer':
        return 'tertiary';
      default:
        return 'medium';
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Manage Questions</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Manage Standalone Questions</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="ion-padding">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <BackButton label="Back" />
            <IonButton 
              fill="outline" 
              size="small" 
              onClick={fetchQuestions}
            >
              <IonIcon icon={refreshOutline} slot="start" />
              Refresh
            </IonButton>
          </div>

          {questions.length === 0 ? (
            <IonCard>
              <IonCardContent>
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <IonText color="medium">
                    <h3>No questions found</h3>
                    <p>Create some standalone questions to manage them here.</p>
                  </IonText>
                </div>
              </IonCardContent>
            </IonCard>
          ) : (
            <IonList>
              {questions.map((question) => {
                const formattedOptions = formatDisplayOptions(question.options);
                
                return (
                  <IonCard key={question.id} style={{ marginBottom: '1rem' }}>
                    <IonCardHeader>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <IonBadge 
                            color={getQuestionTypeColor(question.question_type)}
                            style={{ marginBottom: '0.5rem' }}
                          >
                            {getQuestionTypeDisplay(question.question_type)}
                          </IonBadge>
                          <IonCardTitle style={{ fontSize: '1rem', lineHeight: '1.4' }}>
                            {question.question}
                          </IonCardTitle>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                          <IonButton
                            fill="clear"
                            size="small"
                            color="primary"
                            onClick={() => openEditModal(question)}
                          >
                            <IonIcon icon={pencilOutline} />
                          </IonButton>
                          <IonButton
                            fill="clear"
                            size="small"
                            color="danger"
                            onClick={() => confirmDelete(question)}
                          >
                            <IonIcon icon={trashOutline} />
                          </IonButton>
                        </div>
                      </div>
                    </IonCardHeader>
                    
                    <IonCardContent>
                      {question.question_type === 'multiple_choice' && formattedOptions.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <IonText color="medium" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Options:
                          </IonText>
                          <div style={{ marginTop: '0.5rem' }}>
                            {formattedOptions.map((option, idx) => (
                              <div 
                                key={idx} 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  marginBottom: '0.25rem',
                                  padding: '0.25rem',
                                  backgroundColor: option === question.answer ? 'var(--ion-color-success-tint)' : 'var(--ion-color-light)',
                                  borderRadius: '4px',
                                  fontSize: '0.85rem'
                                }}
                              >
                                <IonIcon 
                                  icon={option === question.answer ? checkmarkCircleOutline : closeCircleOutline}
                                  color={option === question.answer ? 'success' : 'medium'}
                                  style={{ marginRight: '0.5rem' }}
                                />
                                <span>{String.fromCharCode(65 + idx)}. {option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div style={{ marginBottom: '0.5rem' }}>
                        <IonText color="medium" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                          Correct Answer:
                        </IonText>
                        <IonText style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}>
                          {question.answer}
                        </IonText>
                      </div>
                      
                      {question.explanation && (
                        <div>
                          <IonText color="medium" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Explanation:
                          </IonText>
                          <IonText style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.85rem', lineHeight: '1.3' }}>
                            {question.explanation}
                          </IonText>
                        </div>
                      )}
                    </IonCardContent>
                  </IonCard>
                );
              })}
            </IonList>
          )}
        </div>

        {/* Edit Modal */}
        <IonModal isOpen={editModal} onDidDismiss={closeEditModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Question</IonTitle>
              <IonButton
                slot="end"
                fill="clear"
                onClick={closeEditModal}
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          
          <IonContent className="ion-padding">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Question Details</IonCardTitle>
              </IonCardHeader>
              
              <IonCardContent>
                {/* Question Text */}
                <IonItem className={errors.question ? 'ion-invalid' : ''}>
                  <IonLabel position="stacked">
                    Question Text <span style={{ color: 'red' }}>*</span>
                  </IonLabel>
                  <IonTextarea
                    value={currentQuestion.question}
                    placeholder="Enter your question here..."
                    rows={3}
                    onIonInput={(e) => handleQuestionChange(e.detail.value!)}
                  />
                  {errors.question && (
                    <IonText color="danger" style={{ fontSize: '0.8rem' }}>
                      {errors.question}
                    </IonText>
                  )}
                </IonItem>

                {/* Question Type */}
                <IonItem>
                  <IonLabel position="stacked">Question Type</IonLabel>
                  <IonSelect
                    value={currentQuestion.question_type}
                    onIonChange={(e) => handleQuestionTypeChange(e.detail.value)}
                    interface="popover"
                  >
                    <IonSelectOption value="multiple_choice">Multiple Choice</IonSelectOption>
                    <IonSelectOption value="true_false">True/False</IonSelectOption>
                    <IonSelectOption value="short_answer">Short Answer</IonSelectOption>
                  </IonSelect>
                </IonItem>

                {/* Multiple Choice Options */}
                {currentQuestion.question_type === 'multiple_choice' && (
                  <div style={{ marginTop: '1rem' }}>
                    <IonText color="medium" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                      Options <span style={{ color: 'red' }}>*</span>
                    </IonText>
                    {(['A', 'B', 'C', 'D'] as const).map((optionKey) => (
                      <IonItem key={optionKey}>
                        <IonLabel position="stacked">Option {optionKey}</IonLabel>
                        <IonInput
                          value={currentQuestion.options[optionKey]}
                          placeholder={`Enter option ${optionKey}...`}
                          onIonInput={(e) => handleOptionChange(optionKey, e.detail.value!)}
                        />
                      </IonItem>
                    ))}
                    {errors.options && (
                      <IonText color="danger" style={{ fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                        {errors.options}
                      </IonText>
                    )}
                  </div>
                )}

                {/* True/False Options Display */}
                {currentQuestion.question_type === 'true_false' && (
                  <div style={{ marginTop: '1rem' }}>
                    <IonText color="medium" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                      Options (Auto-generated)
                    </IonText>
                    <IonItem>
                      <IonLabel>Option A: True</IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Option B: False</IonLabel>
                    </IonItem>
                  </div>
                )}

                {/* Answer Selection */}
                <IonItem className={errors.answer ? 'ion-invalid' : ''} style={{ marginTop: '1rem' }}>
                  <IonLabel position="stacked">
                    Correct Answer <span style={{ color: 'red' }}>*</span>
                  </IonLabel>
                  {currentQuestion.question_type === 'multiple_choice' ? (
                    <IonSelect
                      value={currentQuestion.answer}
                      placeholder="Select the correct answer"
                      onIonChange={(e) => handleAnswerChange(e.detail.value)}
                      interface="popover"
                    >
                      {Object.entries(currentQuestion.options)
                        .filter(([_, value]) => value.trim() !== '')
                        .map(([key, value]) => (
                          <IonSelectOption key={key} value={value}>
                            {key}: {value}
                          </IonSelectOption>
                        ))}
                    </IonSelect>
                  ) : currentQuestion.question_type === 'true_false' ? (
                    <IonSelect
                      value={currentQuestion.answer}
                      placeholder="Select True or False"
                      onIonChange={(e) => handleAnswerChange(e.detail.value)}
                      interface="popover"
                    >
                      <IonSelectOption value="True">True</IonSelectOption>
                      <IonSelectOption value="False">False</IonSelectOption>
                    </IonSelect>
                  ) : (
                    <IonInput
                      value={currentQuestion.answer}
                      placeholder="Enter the correct answer..."
                      onIonInput={(e) => handleAnswerChange(e.detail.value!)}
                    />
                  )}
                  {errors.answer && (
                    <IonText color="danger" style={{ fontSize: '0.8rem' }}>
                      {errors.answer}
                    </IonText>
                  )}
                </IonItem>

                {/* Explanation */}
                <IonItem>
                  <IonLabel position="stacked">Explanation (Optional)</IonLabel>
                  <IonTextarea
                    value={currentQuestion.explanation}
                    placeholder="Provide an explanation for the answer..."
                    rows={3}
                    onIonInput={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.detail.value! }))}
                  />
                </IonItem>
              </IonCardContent>
            </IonCard>

            {/* Action Buttons */}
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <IonButton 
                expand="block" 
                onClick={handleUpdate}
                disabled={saving}
                style={{ flex: 1 }}
              >
                <IonIcon icon={saveOutline} slot="start" />
                {saving ? 'Updating...' : 'Update Question'}
              </IonButton>
              
              <IonButton 
                expand="block" 
                fill="outline" 
                onClick={closeEditModal}
                disabled={saving}
                style={{ flex: 1 }}
              >
                Cancel
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={deleteAlert.isOpen}
          onDidDismiss={() => setDeleteAlert({ isOpen: false, questionId: null, questionText: '' })}
          header="Confirm Delete"
          subHeader="Are you sure you want to delete this question?"
          message={`"${deleteAlert.questionText}"`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: handleDelete,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default StandaloneQuestionsCRUD;