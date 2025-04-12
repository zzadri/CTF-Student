import { useState, useEffect } from 'react';
import { Table, Button, Modal, TextInput, ColorInput, LoadingOverlay, ActionIcon, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  challengeCount: number;
}

interface CachedData {
  data: any;
  timestamp: number;
}

const cache: { [key: string]: CachedData } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchWithCache = async (url: string) => {
  const cachedData = cache[url];
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  const response = await axios.get(url);
  cache[url] = {
    data: response.data,
    timestamp: now
  };
  return response.data;
};

function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#1971c2',
    icon: 'fa-folder'
  });

  useEffect(() => {
    const handleOpenModal = () => setModalOpen(true);
    window.addEventListener('openCategoryModal', handleOpenModal);
    return () => window.removeEventListener('openCategoryModal', handleOpenModal);
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await fetchWithCache(`${import.meta.env.VITE_API_URL}/admin/categories`);
      setCategories(data.categories);
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
      if (editingCategory) {
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/categories/${editingCategory.id}`, formData);
        notifications.show({
          title: 'Succès',
          message: 'Catégorie modifiée avec succès',
          color: 'green'
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/categories`, formData);
        notifications.show({
          title: 'Succès',
          message: 'Catégorie créée avec succès',
          color: 'green'
        });
      }
      setModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', color: '#1971c2', icon: 'fa-folder' });
      // Invalider le cache après une modification
      delete cache[`${import.meta.env.VITE_API_URL}/admin/categories`];
      fetchCategories();
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Une erreur est survenue',
        color: 'red'
      });
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/categories/${categoryId}`);
      notifications.show({
        title: 'Succès',
        message: 'Catégorie supprimée avec succès',
        color: 'green'
      });
      // Invalider le cache après une suppression
      delete cache[`${import.meta.env.VITE_API_URL}/admin/categories`];
      fetchCategories();
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de supprimer la catégorie',
        color: 'red'
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon
    });
    setModalOpen(true);
  };

  if (loading) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <div>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th className="text-white">Nom</th>
            <th className="text-white">Couleur</th>
            <th className="text-white">Icône</th>
            <th className="text-white">Challenges</th>
            <th className="text-white">Actions</th>
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
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-white">{category.color}</span>
                </div>
              </td>
              <td>
                <i className={`fas ${category.icon} text-white`} />
              </td>
              <td className="text-white">{category.challengeCount}</td>
              <td>
                <div className="flex gap-2">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => {
                      setEditingCategory(category);
                      setFormData({
                        name: category.name,
                        color: category.color,
                        icon: category.icon
                      });
                      setModalOpen(true);
                    }}
                    title="Modifier la catégorie"
                  >
                    <FontAwesomeIcon icon={faPen} size="sm" />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
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
      >
        <div className="space-y-4">
          <TextInput
            label="Nom"
            placeholder="Nom de la catégorie"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <ColorInput
            label="Couleur"
            value={formData.color}
            onChange={(color) => setFormData({ ...formData, color })}
            required
          />
          <TextInput
            label="Icône"
            placeholder="Classe Font Awesome (ex: fa-folder)"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            required
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>
              {editingCategory ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CategoryManagement; 