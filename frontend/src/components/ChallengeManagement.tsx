import { useState, useEffect } from 'react';
import { Table, Button, Modal, TextInput, NumberInput, Select, Textarea, LoadingOverlay, ActionIcon, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface Challenge {
  id: string;
  name: string;
  description: string;
  points: number;
  category: {
    id: string;
    name: string;
    color: string;
  };
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  solvedCount: number;
}

interface Category {
  id: string;
  name: string;
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

function ChallengeManagement() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points: 100,
    categoryId: '',
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD',
    flag: '',
    dockerImage: ''
  });

  useEffect(() => {
    const handleOpenModal = () => setModalOpen(true);
    window.addEventListener('openChallengeModal', handleOpenModal);
    return () => window.removeEventListener('openChallengeModal', handleOpenModal);
  }, []);

  const fetchData = async () => {
    try {
      const [challengesData, categoriesData] = await Promise.all([
        fetchWithCache(`${import.meta.env.VITE_API_URL}/admin/challenges`),
        fetchWithCache(`${import.meta.env.VITE_API_URL}/admin/categories`)
      ]);
      setChallenges(challengesData.challenges);
      setCategories(categoriesData.categories);
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de charger les données',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editingChallenge) {
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/challenges/${editingChallenge.id}`, formData);
        notifications.show({
          title: 'Succès',
          message: 'Challenge modifié avec succès',
          color: 'green'
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/challenges`, formData);
        notifications.show({
          title: 'Succès',
          message: 'Challenge créé avec succès',
          color: 'green'
        });
      }
      setModalOpen(false);
      setEditingChallenge(null);
      setFormData({
        name: '',
        description: '',
        points: 100,
        categoryId: '',
        difficulty: 'MEDIUM',
        flag: '',
        dockerImage: ''
      });
      // Invalider le cache après une modification
      delete cache[`${import.meta.env.VITE_API_URL}/admin/challenges`];
      fetchData();
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Une erreur est survenue',
        color: 'red'
      });
    }
  };

  const handleDelete = async (challengeId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce challenge ?')) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/challenges/${challengeId}`);
      notifications.show({
        title: 'Succès',
        message: 'Challenge supprimé avec succès',
        color: 'green'
      });
      // Invalider le cache après une suppression
      delete cache[`${import.meta.env.VITE_API_URL}/admin/challenges`];
      fetchData();
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de supprimer le challenge',
        color: 'red'
      });
    }
  };

  const handleEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      name: challenge.name,
      description: challenge.description,
      points: challenge.points,
      categoryId: challenge.category.id,
      difficulty: challenge.difficulty,
      flag: '',
      dockerImage: ''
    });
    setModalOpen(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'green';
      case 'MEDIUM':
        return 'yellow';
      case 'HARD':
        return 'red';
      default:
        return 'gray';
    }
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
            <th className="text-white">Catégorie</th>
            <th className="text-white">Difficulté</th>
            <th className="text-white">Points</th>
            <th className="text-white">Résolutions</th>
            <th className="text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {challenges.map((challenge) => (
            <tr key={challenge.id}>
              <td className="text-white">{challenge.name}</td>
              <td>
                <Badge
                  style={{ backgroundColor: challenge.category.color }}
                >
                  {challenge.category.name}
                </Badge>
              </td>
              <td>
                <Badge color={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
              </td>
              <td className="text-white">{challenge.points}</td>
              <td className="text-white">{challenge.solvedCount}</td>
              <td>
                <div className="flex gap-2">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => handleEdit(challenge)}
                    title="Modifier"
                  >
                    <FontAwesomeIcon icon={faPen} size="sm" />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => handleDelete(challenge.id)}
                    title="Supprimer"
                  >
                    <FontAwesomeIcon icon={faTrash} size="sm" />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="gray"
                    component="a"
                    href={`/challenges/${challenge.id}`}
                    target="_blank"
                    title="Voir"
                  >
                    <FontAwesomeIcon icon={faEye} size="sm" />
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
          setEditingChallenge(null);
          setFormData({
            name: '',
            description: '',
            points: 100,
            categoryId: '',
            difficulty: 'MEDIUM',
            flag: '',
            dockerImage: ''
          });
        }}
        title={editingChallenge ? 'Modifier un challenge' : 'Créer un challenge'}
        size="lg"
      >
        <div className="space-y-4">
          <TextInput
            label="Nom"
            placeholder="Nom du challenge"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            placeholder="Description du challenge"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            minRows={3}
            required
          />
          <NumberInput
            label="Points"
            value={formData.points}
            onChange={(value) => setFormData({ ...formData, points: typeof value === 'number' ? value : 100 })}
            min={0}
            max={1000}
            required
          />
          <Select
            label="Catégorie"
            placeholder="Sélectionner une catégorie"
            value={formData.categoryId}
            onChange={(value) => setFormData({ ...formData, categoryId: value || '' })}
            data={categories.map((cat) => ({
              value: cat.id,
              label: cat.name
            }))}
            required
          />
          <Select
            label="Difficulté"
            value={formData.difficulty}
            onChange={(value) => setFormData({ ...formData, difficulty: (value as 'EASY' | 'MEDIUM' | 'HARD') || 'MEDIUM' })}
            data={[
              { value: 'EASY', label: 'Facile' },
              { value: 'MEDIUM', label: 'Moyen' },
              { value: 'HARD', label: 'Difficile' }
            ]}
            required
          />
          <TextInput
            label="Flag"
            placeholder="Flag du challenge"
            value={formData.flag}
            onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
            required={!editingChallenge}
          />
          <TextInput
            label="Image Docker"
            placeholder="Nom de l'image Docker (optionnel)"
            value={formData.dockerImage}
            onChange={(e) => setFormData({ ...formData, dockerImage: e.target.value })}
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>
              {editingChallenge ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ChallengeManagement; 