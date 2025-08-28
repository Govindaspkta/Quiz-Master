import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonLoading, IonSelect, IonSelectOption, IonRadioGroup, IonRadio, IonItem, IonLabel, IonInput, IonIcon } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { helpCircleOutline, checkmarkCircleOutline, documentTextOutline, listOutline } from 'ionicons/icons';
import api from '../../utils/api';

const AddQuestion: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [options, setOptions] = useState(['', '', '', '']);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const history = useHistory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newQuestion = {
      question,
      question_type: questionType,
      options,
      answer: selectedAnswer, // Selected from radio buttons
      explanation,
    };
    try {
      setIsLoading(true);
      console.log('Sending POST to /api/questions with:', newQuestion);
      const response = await api.post('/api/questions', newQuestion);
      console.log('Response from server:', response.data);
      alert('Question added successfully!');
      history.push('/admin/adminDashboard');
    } catch (err: any) {
      console.error('Failed to add question:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
      });
      alert('Error adding question. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle className="text-center font-bold">Add New Question</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="min-h-full flex items-center justify-center py-8">
          <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-center space-x-3">
                <IonIcon icon={helpCircleOutline} className="text-white text-3xl" />
                <h2 className="text-3xl font-bold text-white">Create Question</h2>
              </div>
              <p className="text-blue-100 text-center mt-2">Build engaging questions for your quiz</p>
            </div>

            {/* Form Section */}
            <div className="px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question Input */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <IonIcon icon={documentTextOutline} className="text-blue-500" />
                    <label className="text-lg font-semibold text-gray-700">Question</label>
                  </div>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700 placeholder-gray-400"
                    placeholder="Enter your question here..."
                    required
                  />
                </div>

                {/* Question Type */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <IonIcon icon={listOutline} className="text-purple-500" />
                    <label className="text-lg font-semibold text-gray-700">Question Type</label>
                  </div>
                  <div className="relative">
                    <IonSelect
                      value={questionType}
                      onIonChange={(e) => {
                        setQuestionType(e.detail.value as string);
                        setSelectedAnswer(''); // Reset selected answer on type change
                      }}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white"
                      interface="popover"
                      required
                    >
                      <IonSelectOption value="multiple_choice">📝 Multiple Choice</IonSelectOption>
                      <IonSelectOption value="true_false">✅ True/False</IonSelectOption>
                      <IonSelectOption value="multiple_answer">🔢 Multiple Answer</IonSelectOption>
                      <IonSelectOption value="short_answer">💭 Short Answer</IonSelectOption>
                    </IonSelect>
                  </div>
                </div>

                {/* Options Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <IonIcon icon={checkmarkCircleOutline} className="text-green-500" />
                    <label className="text-lg font-semibold text-gray-700">Answer Options</label>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <p className="text-sm text-gray-600 mb-4">💡 Select the correct answer by clicking the radio button</p>
                    <IonRadioGroup
                      value={selectedAnswer}
                      onIonChange={(e) => setSelectedAnswer(e.detail.value)}
                    >
                      {options.map((opt, index) => (
                        <div key={index} className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200">
                          <IonItem lines="none" className="--padding-start: 16px; --padding-end: 16px;">
                            <IonRadio 
                              slot="start" 
                              value={opt} 
                              disabled={!opt}
                              className="mr-4"
                            />
                            <div className="flex items-center space-x-3 w-full">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <IonInput
                                value={opt}
                                onIonChange={(e) => {
                                  const newOptions = [...options];
                                  newOptions[index] = e.detail.value as string;
                                  setOptions(newOptions);
                                  if (!selectedAnswer && e.detail.value) setSelectedAnswer(e.detail.value);
                                }}
                                placeholder={`Enter option ${index + 1}...`}
                                className="flex-1"
                                required={questionType === 'multiple_choice' || questionType === 'true_false' || questionType === 'multiple_answer'}
                              />
                            </div>
                          </IonItem>
                        </div>
                      ))}
                    </IonRadioGroup>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <IonIcon icon={documentTextOutline} className="text-amber-500" />
                    <label className="text-lg font-semibold text-gray-700">Explanation</label>
                    <span className="text-sm text-gray-500">(Optional)</span>
                  </div>
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700 placeholder-gray-400 resize-none h-24"
                    placeholder="Provide an explanation for the correct answer..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <IonButton
                    type="submit"
                    expand="block"
                    size="large"
                    className="h-14 rounded-xl"
                    style={{
                      '--background': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                      '--background-hover': 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)',
                      '--color': 'white',
                      '--border-radius': '12px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      textTransform: 'none'
                    }}
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-2">
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Adding Question...</span>
                        </>
                      ) : (
                        <>
                          <IonIcon icon={checkmarkCircleOutline} />
                          <span>Add Question</span>
                        </>
                      )}
                    </div>
                  </IonButton>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <IonLoading
          isOpen={isLoading}
          message="Adding your question..."
          spinner="crescent"
        />
      </IonContent>
    </IonPage>
    
  );
};

export default AddQuestion;