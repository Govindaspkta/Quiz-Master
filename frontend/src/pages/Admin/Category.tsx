import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonAlert,
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonLoading,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  useIonRouter
} from '@ionic/react';
import {
  add,
  create,
  trash,
  checkmark,
  close,
  chevronBack
} from 'ionicons/icons';
import api from '../../utils/api';
import BackButton from '../../components/BackButton';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  quizCount: number;
}

const Category: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useIonRouter();
  const handleBackClick = () => {
    router.push('/admin/admindashboard');
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📚',
    isActive: true
  });

  const icons = ['📚', '🧠', '🌍', '🎭', '🏛️', '🏆', '🎮', '🎨', '🔬', '💻', '🎵', '🎬', '🧒'];

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching categories from /api/categories');
      const response = await api.get('/api/categories'); // Fixed endpoint
      console.log('Categories fetched:', response.data);
      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error: any) {
      console.error('Error fetching categories:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchText === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(
        category =>
          category.name.toLowerCase().includes(searchText.toLowerCase()) ||
          category.description.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchText, categories]);

  const handleInputChange = (e: any) => {
    const name = e.target.name;
    const value = e.detail?.value;
    const checked = e.detail?.checked;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? checked : value
    }));
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '📚',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      isActive: category.isActive
    });
    setShowModal(true);
  };

  const confirmDelete = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setShowAlert(true);
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete === null) return;

    setIsLoading(true);
    setError(null);
    try {
      console.log(`Deleting category with ID: ${categoryToDelete}`);
      await api.delete(`/api/categories/${categoryToDelete}`); // Fixed endpoint
      console.log('Category deleted successfully');
      const updated = categories.filter(cat => cat.id !== categoryToDelete);
      setCategories(updated);
      setFilteredCategories(updated);
    } catch (error: any) {
      console.error('Error deleting category:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setIsLoading(false);
      setCategoryToDelete(null);
    }
  };

  const saveCategory = async () => {
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending request to create category:', formData);
      if (selectedCategory) {
        const response = await api.put(`/api/categories/${selectedCategory.id}`, formData); // Fixed endpoint
        console.log('Category updated:', response.data);
        const updated = categories.map(cat =>
          cat.id === selectedCategory.id ? response.data : cat
        );
        setCategories(updated);
        setFilteredCategories(updated);
      } else {
        const response = await api.post('/api/categories', formData); // Fixed endpoint
        console.log('Category created:', response.data);
        const newCategories = [...categories, response.data];
        setCategories(newCategories);
        setFilteredCategories(newCategories);
      }
    } catch (error: any) {
      console.error('Error saving category:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const handleRefresh = (event: any) => {
    fetchCategories().then(() => {
      event.detail.complete();
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
           <BackButton />
          </IonButtons>
          <IonTitle>Categories</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleAddCategory}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonSearchbar
          value={searchText}
          onIonChange={e => setSearchText(e.detail.value!)}
          placeholder="Search categories"
        />

        {error && (
          <IonItem>
            <IonLabel className="text-red-500">{error}</IonLabel>
          </IonItem>
        )}

        {filteredCategories.length > 0 ? (
          filteredCategories.map(category => (
            <IonCard key={category.id}>
              <IonCardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="text-2xl mr-2">{category.icon}</div>
                    <IonCardTitle>{category.name}</IonCardTitle>
                  </div>
                  <IonBadge color={category.isActive ? 'success' : 'medium'}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </IonBadge>
                </div>
              </IonCardHeader>
              <IonCardContent>
                <p className="text-gray-600">{category.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-gray-500">
                    {category.quizCount} quizzes
                  </div>
                  <div className="flex gap-2">
                    <IonButton fill="clear" color="primary" size="small" onClick={() => handleEditCategory(category)}>
                      <IonIcon slot="start" icon={create} />
                      Edit
                    </IonButton>
                    <IonButton fill="clear" color="danger" size="small" onClick={() => confirmDelete(category.id)}>
                      <IonIcon slot="start" icon={trash} />
                      Delete
                    </IonButton>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-5xl mb-4">🔍</div>
            <p>No categories found</p>
            {searchText && (
              <IonButton fill="clear" size="small" onClick={() => setSearchText('')}>
                Clear search
              </IonButton>
            )}
          </div>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleAddCategory}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>

      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>{selectedCategory ? 'Edit Category' : 'Add Category'}</IonTitle>
            <IonButtons slot="end">
            <BackButton />
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {error && (
            <IonItem>
              <IonLabel className="text-red-500">{error}</IonLabel>
            </IonItem>
          )}
          <div className="space-y-4">
            <IonItem>
              <IonLabel position="stacked">Category Name</IonLabel>
              <IonInput
                name="name"
                value={formData.name}
                onIonChange={handleInputChange}
                placeholder="Enter category name"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Description</IonLabel>
              <IonInput
                name="description"
                value={formData.description}
                onIonChange={handleInputChange}
                placeholder="Enter category description"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Icon</IonLabel>
              <IonSelect name="icon" value={formData.icon} onIonChange={handleInputChange}>
                {icons.map(icon => (
                  <IonSelectOption key={icon} value={icon}>
                    {icon}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel>Active</IonLabel>
              <IonToggle name="isActive" checked={formData.isActive} onIonChange={handleInputChange} />
            </IonItem>

            <div className="pt-4">
              <IonButton expand="block" onClick={saveCategory}>
                <IonIcon slot="start" icon={checkmark} />
                Save Category
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Confirm Delete"
        message="Are you sure you want to delete this category?"
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Delete',
            role: 'destructive',
            handler: handleDeleteCategory
          }
        ]}
      />

      <IonLoading isOpen={isLoading} message="Please wait..." />
    </IonPage>
  );
};

export default Category;