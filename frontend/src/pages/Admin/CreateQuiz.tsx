import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonInput,
  IonTextarea,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonChip,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonCheckbox,
  IonToast,
  IonRow,
  IonCol,
  IonGrid,
  IonFab,
  IonFabButton,
  IonToggle,
  IonSpinner,
  IonAlert,
  IonModal,
  IonText,
} from '@ionic/react';
import {
  addOutline,
  trashOutline,
  saveOutline,
  eyeOutline,
  closeOutline,
  addCircleOutline,
  chevronUpOutline,
  chevronDownOutline,
  reorderFourOutline,
} from 'ionicons/icons';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from '@hello-pangea/dnd';
import { AxiosError } from 'axios';
import api from '../../utils/api';
import { useHistory } from 'react-router-dom';

// Question types
const QUESTION_TYPES = [
  { id: 'multipleChoice', name: 'Multiple Choice' },
  { id: 'trueFalse', name: 'True/False' },
  { id: 'multipleAnswer', name: 'Multiple Answer' },
  { id: 'shortAnswer', name: 'Short Answer' },
];

// Interfaces for type safety
interface Category {
  id: number;
  name: string;
}

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  type: string;
  text: string;
  options: Option[];
  explanation: string;
  correctAnswer?: string | string[];
}

interface ErrorResponse {
  message?: string;
}

// Utility to generate unique IDs
const generateUniqueId = () => Date.now().toString() + Math.floor(Math.random() * 1000);

// Initial empty question template with unique IDs
const emptyQuestion: Question = {
  id: generateUniqueId(),
  type: 'multipleChoice',
  text: '',
  options: [
    { id: generateUniqueId(), text: '', isCorrect: false },
    { id: generateUniqueId(), text: '', isCorrect: false },
    { id: generateUniqueId(), text: '', isCorrect: false },
    { id: generateUniqueId(), text: '', isCorrect: false },
  ],
  explanation: '',
};

const CreateQuiz: React.FC = () => {
  const history = useHistory();
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizCategory, setQuizCategory] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLimit, setTimeLimit] = useState(10);
  const [isPublic, setIsPublic] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [questions, setQuestions] = useState<Question[]>([{ ...emptyQuestion }]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Handle authentication and fetch categories
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    console.log('Initial token:', token, 'Initial role:', role);

    // If token or role is missing, redirect to login
    if (!token || !role) {
      console.log('Token or role missing, redirecting to login');
      setToastMessage('Please log in to create a quiz');
      setShowToast(true);
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      history.replace('/login');
      return;
    }

    // Check if the user is an admin
    if (role !== 'admin') {
      console.log('User is not an admin, redirecting to home');
      setToastMessage('Only admins can create quizzes');
      setShowToast(true);
      history.replace('/tabs/home');
      return;
    }

    // Fetch categories if token and role are valid
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        console.log('Fetching categories with token:', token);
        const response = await api.get('/api/categories');
        console.log('Categories API response:', response.data);
        if (Array.isArray(response.data)) {
          const mappedCategories: Category[] = response.data.map((category: any) => ({
            id: category.id,
            name: category.name || category.category_name || 'Unnamed Category',
          }));
          console.log('Mapped categories:', mappedCategories);
          setCategories(mappedCategories);
        } else {
          throw new Error('Invalid category data format');
        }
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('Error fetching categories:', axiosError.response?.data || axiosError.message, axiosError.response?.status);
        const errorMsg = axiosError.response?.data?.message || axiosError.message || 'Failed to load categories';
        setToastMessage(`Error fetching categories: ${errorMsg}`);
        setShowToast(true);
        // Let the interceptor handle 401/422 redirects
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [history]);

  const handleAddTag = () => {
    if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const addNewQuestion = () => {
    const newQuestion: Question = {
      ...emptyQuestion,
      id: generateUniqueId(),
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updatedQuestions = [...questions];
      updatedQuestions.splice(index, 1);
      setQuestions(updatedQuestions);
      if (currentQuestionIndex >= updatedQuestions.length) {
        setCurrentQuestionIndex(updatedQuestions.length - 1);
      } else if (currentQuestionIndex === index) {
        setCurrentQuestionIndex(Math.max(0, index - 1));
      }
    } else {
      setToastMessage('Quiz must have at least one question');
      setShowToast(true);
    }
  };

  const updateQuestion = (field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      [field]: value ?? '',
    };
    setQuestions(updatedQuestions);
  };

  const updateQuestionType = (type: string) => {
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[currentQuestionIndex];
    let updatedOptions: Option[] = [...currentQuestion.options];

    if (type === 'trueFalse') {
      updatedOptions = updatedOptions.length > 0 ? updatedOptions.slice(0, 2) : [
        { id: generateUniqueId(), text: 'True', isCorrect: false },
        { id: generateUniqueId(), text: 'False', isCorrect: false },
      ];
      updatedOptions = updatedOptions.map((opt, index) => ({
        ...opt,
        text: index === 0 ? 'True' : 'False',
      }));
    } else if (type === 'multipleChoice') {
      if (updatedOptions.length < 4) {
        while (updatedOptions.length < 4) {
          updatedOptions.push({ id: generateUniqueId(), text: '', isCorrect: false });
        }
      }
    } else if (type === 'multipleAnswer') {
      if (updatedOptions.length < 4) {
        while (updatedOptions.length < 4) {
          updatedOptions.push({ id: generateUniqueId(), text: '', isCorrect: false });
        }
      }
    } else if (type === 'shortAnswer') {
      updatedOptions = [];
    }

    updatedOptions = updatedOptions.map((opt, index) => {
      const existingOpt = currentQuestion.options[index];
      return existingOpt ? { ...opt, text: existingOpt.text } : opt;
    });

    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      type,
      options: updatedOptions,
    };
    setQuestions(updatedQuestions);
  };

  const updateQuestionOption = useCallback((optionIndex: number, field: keyof Option, value: any) => {
    const updatedQuestions = [...questions];
    const updatedOptions = [...updatedQuestions[currentQuestionIndex].options];

    const safeValue = field === 'text' ? (value ?? '') : value;
    updatedOptions[optionIndex] = {
      ...updatedOptions[optionIndex],
      [field]: safeValue,
    };

    if (field === 'isCorrect' && value === true && ['multipleChoice', 'trueFalse'].includes(updatedQuestions[currentQuestionIndex].type)) {
      updatedOptions.forEach((option, index) => {
        if (index !== optionIndex) updatedOptions[index] = { ...option, isCorrect: false };
      });
    }

    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      options: updatedOptions,
    };

    setQuestions(updatedQuestions);
  }, [questions, currentQuestionIndex]);

  const addQuestionOption = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (['multipleChoice', 'multipleAnswer'].includes(currentQuestion.type)) {
      const updatedQuestions = [...questions];
      const updatedOptions = [...currentQuestion.options];
      updatedOptions.push({ id: generateUniqueId(), text: '', isCorrect: false });
      updatedQuestions[currentQuestionIndex] = { ...currentQuestion, options: updatedOptions };
      setQuestions(updatedQuestions);
    }
  };

  const removeQuestionOption = (optionIndex: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (['multipleChoice', 'multipleAnswer'].includes(currentQuestion.type) && currentQuestion.options.length > 2) {
      const updatedQuestions = [...questions];
      const updatedOptions = [...currentQuestion.options];
      updatedOptions.splice(optionIndex, 1);
      updatedQuestions[currentQuestionIndex] = { ...currentQuestion, options: updatedOptions };
      setQuestions(updatedQuestions);
    } else {
      setToastMessage('Question must have at least 2 options');
      setShowToast(true);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setQuestions(items);
    if (currentQuestionIndex === result.source.index) {
      setCurrentQuestionIndex(result.destination.index);
    } else if (currentQuestionIndex > result.source.index && currentQuestionIndex <= result.destination.index) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentQuestionIndex < result.source.index && currentQuestionIndex >= result.destination.index) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const saveQuiz = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token used for save:', token);
      if (!token) {
        console.log('No token found during save, redirecting to login');
        setToastMessage('Please log in to save the quiz');
        setShowToast(true);
        history.replace('/login');
        return;
      }

      // Validation
      if (!quizTitle.trim()) {
        console.log('Validation failed: quizTitle is empty', quizTitle);
        throw new Error('Quiz title is required');
      }
      if (quizCategory === null) {
        console.log('Validation failed: quizCategory is null', quizCategory);
        throw new Error('Please select a category');
      }
      if (!difficulty) {
        console.log('Validation failed: difficulty is empty', difficulty);
        throw new Error('Difficulty is required');
      }

      const invalidQuestions = questions.filter((q) => !q.text.trim());
      if (invalidQuestions.length > 0) {
        console.log('Validation failed: Question text is empty for question', questions.indexOf(invalidQuestions[0]) + 1);
        throw new Error(`Question ${questions.indexOf(invalidQuestions[0]) + 1} has no text`);
      }

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (['multipleChoice', 'trueFalse', 'multipleAnswer'].includes(q.type)) {
          const emptyOptions = q.options.filter((o) => !o.text.trim());
          if (emptyOptions.length > 0) {
            console.log('Validation failed: Empty options in question', i + 1, emptyOptions);
            throw new Error(`Question ${i + 1} has empty options`);
          }
          if (!q.options.some((o) => o.isCorrect)) {
            if (q.type === 'trueFalse') {
              console.log('Validation failed: No correct answer selected for trueFalse question', i + 1);
              throw new Error(`Question ${i + 1}: Please select True or False as the correct answer`);
            } else {
              console.log('Validation failed: No correct answer selected for question', i + 1);
              throw new Error(`Question ${i + 1} has no correct answer selected`);
            }
          }
        }
      }

      // Prepare payload
      const quizPayload = {
        title: quizTitle,
        category: quizCategory,
        difficulty,
        description: quizDescription,
        timeLimit: timeLimit,
        isPublic: isPublic,
        questions: questions.map((q) => {
          let correctAnswer: string | string[] = '';
          if (q.type === 'multipleChoice' || q.type === 'trueFalse') {
            const correctOption = q.options.find((opt) => opt.isCorrect);
            correctAnswer = correctOption ? correctOption.text : '';
          } else if (q.type === 'multipleAnswer') {
            correctAnswer = q.options
              .filter((opt) => opt.isCorrect)
              .map((opt) => opt.text);
          } else if (q.type === 'shortAnswer') {
            correctAnswer = q.correctAnswer || '';
          }

          return {
            question: q.text,
            type: q.type,
            options: q.options.length > 0 ? q.options.map((opt) => opt.text) : [],
            correctAnswer: correctAnswer,
            explanation: q.explanation,
          };
        }),
      };

      console.log('Saving quiz payload:', JSON.stringify(quizPayload, null, 2));

      const response = await api.post('/api/quizzes', quizPayload);
      console.log('API response:', response.data);

      setToastMessage('Quiz saved successfully! Quiz ID: ' + response.data.id);
      setShowToast(true);

      // Reset form after successful save
      setQuizTitle('');
      setQuizDescription('');
      setQuizCategory(null);
      setDifficulty('medium');
      setTimeLimit(10);
      setIsPublic(true);
      setTags([]);
      setQuestions([{ ...emptyQuestion }]);
      setCurrentQuestionIndex(0);

      setShowConfirmSave(false);
      history.push('/admin/adminDashboard');
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error('Error saving quiz:', axiosError.response?.data || axiosError.message, axiosError.response?.status);
      const errorMsg = axiosError.response?.data?.message || axiosError.message || 'Failed to save quiz';
      setToastMessage(errorMsg);
      setShowToast(true);
      setShowConfirmSave(false);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    console.log('Questions state updated:', questions);
  }, [questions]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/admin/adminDashboard" />
          </IonButtons>
          <IonTitle className="mr-8">{quizTitle || 'New Quiz'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowPreview(true)}>
              <IonIcon icon={eyeOutline} slot="start" />
              Preview
            </IonButton>
            <IonButton onClick={() => setShowConfirmSave(true)} disabled={isSaving}>
              {isSaving ? <IonSpinner name="dots" /> : <>
                <IonIcon icon={saveOutline} slot="start" />
                Save
              </>}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Quiz Details</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonLabel position="stacked">Title <span className="text-red-500">*</span></IonLabel>
                    <IonInput
                      value={quizTitle}
                      onIonChange={(e) => setQuizTitle(e.detail.value || '')}
                      placeholder="Enter quiz title"
                      required
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Description</IonLabel>
                    <IonTextarea
                      value={quizDescription}
                      onIonChange={(e) => setQuizDescription(e.detail.value || '')}
                      placeholder="Enter quiz description"
                      rows={3}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Category <span className="text-red-500">*</span></IonLabel>
                    {isLoadingCategories ? (
                      <IonSpinner name="dots" />
                    ) : (
                      <IonSelect
                        value={quizCategory}
                        onIonChange={(e) => setQuizCategory(e.detail.value)}
                        placeholder="Select category"
                      >
                        {categories.length === 0 ? (
                          <IonSelectOption disabled>No categories available</IonSelectOption>
                        ) : (
                          categories.map((category) => (
                            <IonSelectOption key={category.id} value={category.id}>
                              {category.name}
                            </IonSelectOption>
                          ))
                        )}
                      </IonSelect>
                    )}
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Difficulty</IonLabel>
                    <IonSelect value={difficulty} onIonChange={(e) => setDifficulty(e.detail.value)}>
                      <IonSelectOption value="easy">Easy</IonSelectOption>
                      <IonSelectOption value="medium">Medium</IonSelectOption>
                      <IonSelectOption value="hard">Hard</IonSelectOption>
                    </IonSelect>
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Time Limit (minutes)</IonLabel>
                    <IonInput
                      type="number"
                      min={1}
                      value={timeLimit}
                      onIonChange={(e) => setTimeLimit(parseInt(e.detail.value || '10', 10))}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel>Public</IonLabel>
                    <IonToggle
                      checked={isPublic}
                      onIonChange={(e) => setIsPublic(e.detail.checked)}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Tags</IonLabel>
                    <IonInput
                      value={tagInput}
                      onIonChange={(e) => setTagInput(e.detail.value || '')}
                      onKeyPress={handleTagKeyPress}
                      placeholder="Add tag and press Enter"
                    />
                    <IonButton
                      slot="end"
                      fill="clear"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                    >
                      <IonIcon icon={addOutline} />
                    </IonButton>
                  </IonItem>
                  <div className="ion-padding-top flex flex-wrap">
                    {tags.map((tag) => (
                      <IonChip key={tag} className="m-1">
                        <IonLabel>{tag}</IonLabel>
                        <IonIcon icon={closeOutline} onClick={() => handleRemoveTag(tag)} />
                      </IonChip>
                    ))}
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Questions</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="questions">
                      {(provided: DroppableProvided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {questions.map((question, index) => (
                            <Draggable key={question.id} draggableId={question.id} index={index}>
                              {(provided: DraggableProvided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-2 mb-2 rounded border ${
                                    currentQuestionIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <IonIcon icon={reorderFourOutline} className="mr-2" />
                                      <div
                                        className="cursor-pointer"
                                        onClick={() => setCurrentQuestionIndex(index)}
                                      >
                                        Q{index + 1}: {question.text.substring(0, 30) || 'New Question'}
                                        {question.text.length > 30 && '...'}
                                      </div>
                                    </div>
                                    <IonButton
                                      fill="clear"
                                      color="danger"
                                      size="small"
                                      onClick={() => removeQuestion(index)}
                                    >
                                      <IonIcon icon={trashOutline} />
                                    </IonButton>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  <IonButton expand="block" onClick={addNewQuestion}>
                    <IonIcon icon={addOutline} slot="start" />
                    Add Question
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
          {questions.length > 0 && (
            <IonRow>
              <IonCol size="12">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Question {currentQuestionIndex + 1}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonItem>
                      <IonLabel position="stacked">Question Type</IonLabel>
                      <IonSelect
                        value={questions[currentQuestionIndex].type}
                        onIonChange={(e) => updateQuestionType(e.detail.value!)}
                      >
                        {QUESTION_TYPES.map((type) => (
                          <IonSelectOption key={type.id} value={type.id}>
                            {type.name}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">
                        Question Text <span className="text-red-500">*</span>
                      </IonLabel>
                      <IonTextarea
                        value={questions[currentQuestionIndex].text}
                        onIonChange={(e) => updateQuestion('text', e.detail.value)}
                        placeholder="Enter your question"
                        rows={3}
                      />
                    </IonItem>
                    {questions[currentQuestionIndex].type === 'multipleChoice' && (
                      <div className="mt-4">
                        <IonLabel className="pl-4">Options (Select the correct answer)</IonLabel>
                        <IonRadioGroup
                          value={questions[currentQuestionIndex].options.find((opt) => opt.isCorrect)?.id}
                          onIonChange={(e) => {
                            const selectedOptionId = e.detail.value;
                            const updatedOptions = questions[currentQuestionIndex].options.map((opt) => ({
                              ...opt,
                              isCorrect: opt.id === selectedOptionId,
                            }));
                            updateQuestion('options', updatedOptions);
                          }}
                        >
                          {questions[currentQuestionIndex].options.map((option, optionIndex) => (
                            <IonItem key={option.id} lines="full">
                              <IonRadio slot="start" value={option.id} />
                              <IonInput
                                value={option.text}
                                onIonChange={(e) => updateQuestionOption(optionIndex, 'text', e.detail.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                onBlur={(e) => updateQuestionOption(optionIndex, 'text', e.target.value)}
                              />
                              {questions[currentQuestionIndex].options.length > 2 && (
                                <IonButton
                                  fill="clear"
                                  color="danger"
                                  slot="end"
                                  onClick={() => removeQuestionOption(optionIndex)}
                                >
                                  <IonIcon icon={trashOutline} />
                                </IonButton>
                              )}
                            </IonItem>
                          ))}
                        </IonRadioGroup>
                        <IonButton fill="clear" expand="block" onClick={addQuestionOption}>
                          <IonIcon icon={addCircleOutline} slot="start" />
                          Add Option
                        </IonButton>
                      </div>
                    )}
                    {questions[currentQuestionIndex].type === 'trueFalse' && (
                      <div className="mt-4">
                        <IonLabel className="pl-4">Options (Select the correct answer)</IonLabel>
                        <IonRadioGroup
                          value={questions[currentQuestionIndex].options.find((opt) => opt.isCorrect)?.id || ''}
                          onIonChange={(e) => {
                            const selectedOptionId = e.detail.value;
                            const updatedOptions = questions[currentQuestionIndex].options.map((opt) => ({
                              ...opt,
                              isCorrect: opt.id === selectedOptionId,
                            }));
                            updateQuestion('options', updatedOptions);
                          }}
                        >
                          {questions[currentQuestionIndex].options.map((option, optionIndex) => (
                            <IonItem key={option.id} lines="full">
                              <IonRadio slot="start" value={option.id} />
                              <IonLabel>{option.text}</IonLabel>
                            </IonItem>
                          ))}
                        </IonRadioGroup>
                      </div>
                    )}
                    {questions[currentQuestionIndex].type === 'multipleAnswer' && (
                      <div className="mt-4">
                        <IonLabel className="pl-4">Options (Select all correct answers)</IonLabel>
                        {questions[currentQuestionIndex].options.map((option, optionIndex) => (
                          <IonItem key={option.id} lines="full">
                            <IonCheckbox
                              slot="start"
                              checked={option.isCorrect}
                              onIonChange={(e) => updateQuestionOption(optionIndex, 'isCorrect', e.detail.checked)}
                            />
                            <IonInput
                              value={option.text}
                              onIonChange={(e) => updateQuestionOption(optionIndex, 'text', e.detail.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              onBlur={(e) => updateQuestionOption(optionIndex, 'text', e.target.value)}
                            />
                            {questions[currentQuestionIndex].options.length > 2 && (
                              <IonButton
                                fill="clear"
                                color="danger"
                                slot="end"
                                onClick={() => removeQuestionOption(optionIndex)}
                              >
                                <IonIcon icon={trashOutline} />
                              </IonButton>
                            )}
                          </IonItem>
                        ))}
                        <IonButton fill="clear" expand="block" onClick={addQuestionOption}>
                          <IonIcon icon={addCircleOutline} slot="start" />
                          Add Option
                        </IonButton>
                      </div>
                    )}
                    {questions[currentQuestionIndex].type === 'shortAnswer' && (
                      <IonItem>
                        <IonLabel position="stacked">Correct Answer</IonLabel>
                        <IonInput
                          value={
                            typeof questions[currentQuestionIndex].correctAnswer === 'string'
                              ? questions[currentQuestionIndex].correctAnswer
                              : undefined
                          }
                          onIonChange={(e) => updateQuestion('correctAnswer', e.detail.value)}
                          placeholder="Enter the correct answer"
                        />
                      </IonItem>
                    )}
                    <IonItem className="mt-4">
                      <IonLabel position="stacked">Explanation (Optional)</IonLabel>
                      <IonTextarea
                        value={questions[currentQuestionIndex].explanation}
                        onIonChange={(e) => updateQuestion('explanation', e.detail.value)}
                        placeholder="Explain why the answer is correct"
                        rows={2}
                      />
                    </IonItem>
                    <div className="flex justify-between mt-4">
                      <IonButton
                        fill="outline"
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                      >
                        <IonIcon icon={chevronUpOutline} slot="start" />
                        Previous
                      </IonButton>
                      <IonButton
                        fill="outline"
                        disabled={currentQuestionIndex === questions.length - 1}
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      >
                        Next
                        <IonIcon icon={chevronDownOutline} slot="end" />
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
        <IonModal isOpen={showPreview} onDidDismiss={() => setShowPreview(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Quiz Preview</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowPreview(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <h2>{quizTitle || 'Untitled Quiz'}</h2>
            <p>{quizDescription || 'No description'}</p>
            <IonText>
              <p><strong>Category:</strong> {categories.find(cat => cat.id === quizCategory)?.name || 'Not selected'}</p>
              <p><strong>Difficulty:</strong> {difficulty}</p>
              <p><strong>Time Limit:</strong> {timeLimit} minutes</p>
              <p><strong>Public:</strong> {isPublic ? 'Yes' : 'No'}</p>
              <p><strong>Tags:</strong> {tags.length > 0 ? tags.join(', ') : 'None'}</p>
            </IonText>
            <h3 className="mt-4">Questions</h3>
            {questions.length === 0 ? (
              <p>No questions added yet.</p>
            ) : (
              questions.map((question, index) => (
                <IonCard key={question.id} className="mt-2">
                  <IonCardHeader>
                    <IonCardTitle>Question {index + 1}: {question.text || 'Untitled'}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p><strong>Type:</strong> {QUESTION_TYPES.find(type => type.id === question.type)?.name}</p>
                    {['multipleChoice', 'trueFalse', 'multipleAnswer'].includes(question.type) && (
                      <>
                        <p><strong>Options:</strong></p>
                        <ul>
                          {question.options.map(opt => (
                            <li key={opt.id}>
                              {opt.text} {opt.isCorrect && <span className="text-green-500">(Correct)</span>}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {question.type === 'shortAnswer' && (
                      <p>
                        <strong>Correct Answer:</strong>{' '}
                        {typeof question.correctAnswer === 'string'
                          ? question.correctAnswer || 'Not set'
                          : Array.isArray(question.correctAnswer)
                          ? question.correctAnswer.join(', ')
                          : 'Not set'}
                      </p>
                    )}
                    <p><strong>Explanation:</strong> {question.explanation || 'None'}</p>
                  </IonCardContent>
                </IonCard>
              ))
            )}
          </IonContent>
        </IonModal>
      </IonContent>
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={addNewQuestion}>
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
      />
      <IonAlert
        isOpen={showConfirmSave}
        onDidDismiss={() => setShowConfirmSave(false)}
        header="Save Quiz"
        message="Are you sure you want to save this quiz?"
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Save',
            handler: saveQuiz,
          },
        ]}
      />
    </IonPage>
  );
};

export default CreateQuiz;