import { useState, useEffect } from 'react';
import { Table, Button, Modal, TextInput, ColorInput, LoadingOverlay, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faFolder, faCode, faLock, faBug, faGears } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { adminApiService } from '../services/admin-api.service';
import { apiService, Category } from '../services/api.service';

library.add(faFolder, faCode, faLock, faBug, faGears);

interface CategoryWithCount extends Category {
  challengeCount: number;
}

function CategoryManagement() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#1971c2',
    icon: 'fa-folder'
  });

  useEffect(() => {
    const handleOpenModal = () => {
      setEditingCategory(null);
      setFormData({ name: '', color: '#1971c2', icon: 'fa-folder' });
      setModalOpen(true);
    };
    window.addEventListener('openCategoryModal', handleOpenModal);
    return () => window.removeEventListener('openCategoryModal', handleOpenModal);
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData.map((category: Category) => ({
        ...category,
        challengeCount: category._count?.challenges ?? 0
      })));
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de charger la liste des catégories',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.color || !formData.icon) {
        notifications.show({
          title: 'Erreur',
          message: 'Tous les champs sont requis',
          color: 'red'
        });
        return;
      }

      const categoryData = {
        name: formData.name,
        color: formData.color,
        icon: formData.icon
      };

      if (editingCategory) {
        // Mise à jour d'une catégorie existante
        await adminApiService.updateCategory(editingCategory.id, categoryData);
        notifications.show({
          title: 'Succès',
          message: 'Catégorie modifiée avec succès',
          color: 'green'
        });
      } else {
        // Création d'une nouvelle catégorie
        await adminApiService.createCategory(categoryData);
        notifications.show({
          title: 'Succès',
          message: 'Catégorie créée avec succès',
          color: 'green'
        });
      }

      setModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', color: '#1971c2', icon: 'fa-folder' });
      fetchCategories();
    } catch (error: any) {
      notifications.show({
        title: 'Erreur',
        message: error.response?.data?.message || 'Une erreur est survenue',
        color: 'red'
      });
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await adminApiService.deleteCategory(categoryId);
      notifications.show({
        title: 'Succès',
        message: 'Catégorie supprimée avec succès',
        color: 'green'
      });
      fetchCategories();
    } catch (error: any) {
      notifications.show({
        title: 'Erreur',
        message: error.response?.data?.message || 'Impossible de supprimer la catégorie',
        color: 'red'
      });
    }
  };

  const handleEdit = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color || '#1971c2',
      icon: category.icon || 'fa-folder'
    });
    setModalOpen(true);
  };

  if (loading) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <div className="space-y-4">
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th className="text-white" style={{ width: '30%' }}>Nom</th>
            <th className="text-white" style={{ width: '25%' }}>Couleur</th>
            <th className="text-white text-center" style={{ width: '15%' }}>Icône</th>
            <th className="text-white text-center" style={{ width: '15%' }}>Challenges</th>
            <th className="text-white text-center" style={{ width: '15%' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="text-white">{category.name}</td>
              <td>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: category.color ?? '#1971c2' }}
                  />
                  <span className="text-white">{category.color ?? '#1971c2'}</span>
                </div>
              </td>
              <td className="text-center">
                <FontAwesomeIcon 
                  icon={category.icon ? category.icon.replace('fa-', '') as any : 'folder'} 
                  className="text-white text-xl"
                />
              </td>
              <td className="text-white text-center">{category.challengeCount}</td>
              <td>
                <div className="flex justify-center gap-2">
                  <ActionIcon
                    variant="filled"
                    color="blue"
                    onClick={() => handleEdit(category)}
                    title="Modifier la catégorie"
                  >
                    <FontAwesomeIcon icon={faPen} size="sm" />
                  </ActionIcon>
                  <ActionIcon
                    variant="filled"
                    color="red"
                    onClick={() => handleDelete(category.id)}
                    title="Supprimer la catégorie"
                  >
                    <FontAwesomeIcon icon={faTrash} size="sm" />
                  </ActionIcon>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
          setFormData({ name: '', color: '#1971c2', icon: 'fa-folder' });
        }}
        title={editingCategory ? 'Modifier une catégorie' : 'Créer une catégorie'}
        styles={{
          header: { backgroundColor: '#1A1B1E', color: 'white' },
          content: { backgroundColor: '#1A1B1E' },
          body: { color: 'white' }
        }}
      >
        <div className="space-y-4">
          <TextInput
            label="Nom"
            placeholder="Nom de la catégorie"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              },
              label: { color: 'white' }
            }}
          />
          <ColorInput
            label="Couleur"
            value={formData.color}
            onChange={(color) => setFormData({ ...formData, color })}
            required
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              },
              label: { color: 'white' }
            }}
          />
          <TextInput
            label="Icône"
            placeholder="Classe Font Awesome (ex: fa-folder)"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            required
            styles={{
              input: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              },
              label: { color: 'white' }
            }}
          />
          <div className="flex justify-end">
            <Button
              color={editingCategory ? 'blue' : 'green'}
              onClick={handleSubmit}
            >
              {editingCategory ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CategoryManagement; 