import { useState, useEffect } from 'react';
import { Table, Button, Modal, TextInput, NumberInput, Select, Textarea, LoadingOverlay, ActionIcon, Badge, FileInput, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faEye, faPlus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from '../assets/css/ChallengeManagement.module.css';

type ChallengeType = 'URL' | 'IMAGE' | 'FILE';
type ResourceType = 'LINK' | 'FILE';
type Difficulty = 'EZ' | 'EASY' | 'NORMAL' | 'HARD' | 'EXPERT';

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  category: {
    id: string;
    name: string;
    color: string;
  };
  difficulty: Difficulty;
  type: ChallengeType;
  solvedBy?: {
    _count: number;
  };
  subtitle?: string;
  resources?: Resource[];
}

interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

interface Resource {
  type: ResourceType;
  value: string;
  file?: File;
}

interface FormData {
  title: string;
  subtitle: string;
  description: string;
  points: number;
  categoryId: string;
  difficulty: Difficulty;
  flag: string;
  type: ChallengeType;
  url: string;
  file: File | null;
  imageb64?: string;
  resources: Resource[];
}

function ChallengeManagement() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subtitle: '',
    description: '',
    points: 5,
    categoryId: '',
    difficulty: 'EASY',
    flag: '',
    type: 'URL',
    url: '',
    file: null,
    imageb64: undefined,
    resources: []
  });

  useEffect(() => {
    const handleOpenModal = () => setModalOpen(true);
    window.addEventListener('openChallengeModal', handleOpenModal);
    return () => window.removeEventListener('openChallengeModal', handleOpenModal);
  }, []);

  const fetchData = async () => {
    try {
      const [challengesData, categoriesData] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/challenges`),
        axios.get(`${import.meta.env.VITE_API_URL}/categories`)
      ]);
      setChallenges(challengesData.data.data || []);
      if (Array.isArray(categoriesData.data)) {
        setCategories(categoriesData.data);
      } else if (categoriesData.data.success && Array.isArray(categoriesData.data.data)) {
        setCategories(categoriesData.data.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
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
      // Validation côté client
      if (!formData.title || !formData.description || !formData.difficulty || 
          !formData.points || !formData.categoryId || !formData.type) {
        notifications.show({
          title: 'Erreur',
          message: 'Tous les champs requis doivent être remplis',
          color: 'red'
        });
        return;
      }

      // Le flag est obligatoire uniquement pour la création
      if (!editingChallenge && !formData.flag) {
        notifications.show({
          title: 'Erreur',
          message: 'Le flag est requis lors de la création d\'un challenge',
          color: 'red'
        });
        return;
      }

      // Si c'est un challenge de type URL, vérifier que l'URL est fournie
      if (formData.type === 'URL' && !formData.url) {
        notifications.show({
          title: 'Erreur',
          message: 'L\'URL est requise pour un challenge de type URL',
          color: 'red'
        });
        return;
      }

      // Si c'est un challenge de type IMAGE ou FILE, vérifier qu'un fichier est fourni (seulement pour la création)
      if (!editingChallenge && (formData.type === 'IMAGE' || formData.type === 'FILE') && !formData.file) {
        notifications.show({
          title: 'Erreur',
          message: 'Un fichier est requis pour un challenge de type IMAGE ou FILE',
          color: 'red'
        });
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('points', formData.points.toString());
      formDataToSend.append('flag', formData.flag);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('type', formData.type);

      if (formData.type === 'URL') {
        formDataToSend.append('url', formData.url);
      } else if (formData.file) {
        formDataToSend.append('file', formData.file);
        
        // Si c'est un challenge de type IMAGE, ajouter également l'image en base64
        if (formData.type === 'IMAGE' && formData.imageb64) {
          formDataToSend.append('imageb64', formData.imageb64);
        }
      }

      // Ajouter les ressources additionnelles
      const resourcesArray: any[] = [];
      formData.resources
        .filter(r => r.value !== '')
        .forEach((resource) => {
          if (resource.type === 'LINK') {
            resourcesArray.push({
              type: resource.type,
              value: resource.value
            });
          } else if (resource.file) {
            formDataToSend.append('resources', resource.file);
          }
        });
      
      // Convertir les ressources LINK en JSON
      if (resourcesArray.length > 0) {
        formDataToSend.append('resourcesData', JSON.stringify(resourcesArray));
      }
      
      // Fermer le modal avant de commencer la requête pour une meilleure UX
      setModalOpen(false);
      
      if (editingChallenge) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/challenges/${editingChallenge.id}`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        notifications.show({
          title: 'Succès',
          message: 'Challenge modifié avec succès',
          color: 'green'
        });
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/challenges`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        if (response.data.success) {
          notifications.show({
            title: 'Succès',
            message: 'Challenge créé avec succès',
            color: 'green'
          });
        }
      }
      
      // Réinitialiser le formulaire
      setEditingChallenge(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        points: 5,
        categoryId: '',
        difficulty: 'EASY',
        flag: '',
        type: 'URL',
        url: '',
        file: null,
        imageb64: undefined,
        resources: []
      });
      
      // Actualiser les données
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      notifications.show({
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la création du challenge',
        color: 'red'
      });
    }
  };

  const handleDelete = async (challengeId: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/challenges/${challengeId}`);
      
      // Actualiser les données localement
      setChallenges(prev => prev.filter(challenge => challenge.id !== challengeId));
      
      notifications.show({
        title: 'Succès',
        message: 'Challenge supprimé avec succès',
        color: 'green'
      });
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
    
    // Récupération complète des données du challenge avant édition
    axios.get(`${import.meta.env.VITE_API_URL}/challenges/${challenge.id}`)
      .then(response => {
        const fullChallengeData = response.data.data || response.data;
        
        setFormData({
          title: fullChallengeData.title,
          subtitle: fullChallengeData.subtitle || '',
          description: fullChallengeData.description,
          points: fullChallengeData.points,
          categoryId: fullChallengeData.categoryId,
          difficulty: fullChallengeData.difficulty,
          flag: '', // Le flag n'est jamais renvoyé pour des raisons de sécurité
          type: fullChallengeData.type,
          url: fullChallengeData.url || '',
          file: null, // On ne peut pas récupérer le fichier original
          imageb64: fullChallengeData.imageb64,
          resources: Array.isArray(fullChallengeData.resources) 
            ? fullChallengeData.resources.map((r: any) => ({
                type: r.type,
                value: r.value || r.name || '',
                file: null
              })) 
            : []
        });
        
        setModalOpen(true);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des détails du challenge:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de charger les détails du challenge',
          color: 'red'
        });
      });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EZ':
        return 'green';
      case 'EASY':
        return 'teal';
      case 'NORMAL':
        return 'yellow';
      case 'HARD':
        return 'orange';
      case 'EXPERT':
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
      <Table striped={false} highlightOnHover={false} className={styles.tableContainer}>
        <thead>
          <tr>
            <th className={styles.headerCell}>Nom</th>
            <th className={styles.headerCell}>Catégorie</th>
            <th className={styles.headerCell}>Difficulté</th>
            <th className={styles.headerCell}>Points</th>
            <th className={styles.headerCell}>Résolutions</th>
            <th className={styles.headerCell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {challenges.map((challenge) => (
            <tr key={challenge.id} className={styles.rowHover}>
              <td>
                <span className={styles.challengeTitle}>{challenge.title}</span>
              </td>
              <td>
                <div 
                  className={styles.categoryBadge}
                  style={{ backgroundColor: challenge.category.color || '#1c7ed6' }}
                >
                  {challenge.category.name}
                </div>
              </td>
              <td>
                <Badge color={getDifficultyColor(challenge.difficulty)} className={styles.badge}>
                  {challenge.difficulty}
                </Badge>
              </td>
              <td className="text-white">{challenge.points}</td>
              <td className="text-white">{challenge.solvedBy?._count || 0}</td>
              <td>
                <div className={styles.actionButtons}>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleEdit(challenge)}
                    title="Modifier"
                    radius="sm"
                    size="md"
                    className="bg-blue-500/10 hover:bg-blue-500/20"
                  >
                    <FontAwesomeIcon icon={faPen} size="sm" />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete(challenge.id)}
                    title="Supprimer"
                    radius="sm"
                    size="md"
                    className="bg-red-500/10 hover:bg-red-500/20"
                  >
                    <FontAwesomeIcon icon={faTrash} size="sm" />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    component="a"
                    href={`/challenges/${challenge.id}`}
                    target="_blank"
                    title="Voir"
                    radius="sm"
                    size="md"
                    className="bg-gray-500/10 hover:bg-gray-500/20"
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
            title: '',
            subtitle: '',
            description: '',
            points: 5,
            categoryId: '',
            difficulty: 'EASY',
            flag: '',
            type: 'URL',
            url: '',
            file: null,
            imageb64: undefined,
            resources: []
          });
        }}
        title={editingChallenge ? 'Modifier un challenge' : 'Créer un challenge'}
        size="xl"
        classNames={{
          header: styles.modalHeader,
          content: styles.modalContent,
          body: styles.modalBody,
          close: styles.modalClose,
          inner: styles.modalInner
        }}
      >
        <div>
          <TextInput
            label="Titre"
            placeholder="Entrez le titre du challenge"
            value={formData.title}
            onChange={(event) => setFormData({ ...formData, title: event.currentTarget.value })}
            classNames={{
              input: styles.input,
              label: styles.label
            }}
            className={styles.formGroup}
          />
          <TextInput
            label="Sous-titre"
            placeholder="Entrez le sous-titre du challenge"
            value={formData.subtitle}
            onChange={(event) => setFormData({ ...formData, subtitle: event.currentTarget.value })}
            classNames={{
              input: styles.input,
              label: styles.label
            }}
            className={styles.formGroup}
          />
          <Textarea
            label="Description"
            placeholder="Entrez la description du challenge"
            value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.currentTarget.value })}
            minRows={6}
            maxRows={12}
            autosize
            classNames={{
              input: `${styles.input} ${styles.description}`,
              label: styles.label
            }}
            className={styles.formGroup}
          />
          <NumberInput
            label="Points"
            placeholder="Entrez le nombre de points"
            value={formData.points}
            onChange={(value) => setFormData({ ...formData, points: Number(value) || 0 })}
            min={0}
            classNames={{
              input: styles.input,
              label: styles.label
            }}
            className={styles.formGroup}
          />
          <TextInput
            label="Flag"
            placeholder="Entrez le flag du challenge (ex: CTF{flag_secret})"
            value={formData.flag}
            onChange={(event) => setFormData({ ...formData, flag: event.currentTarget.value })}
            classNames={{
              input: styles.input,
              label: styles.label
            }}
            className={styles.formGroup}
            required
          />
          <Select
            label="Catégorie"
            placeholder="Sélectionnez une catégorie"
            data={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
            value={formData.categoryId}
            onChange={(value) => setFormData({ ...formData, categoryId: value || '' })}
            classNames={{
              input: styles.input,
              label: styles.label,
              dropdown: styles.dropdown,
              option: styles.option
            }}
            className={styles.formGroup}
          />
          <Select
            label="Difficulté"
            placeholder="Sélectionnez une difficulté"
            data={['EZ', 'EASY', 'NORMAL', 'HARD', 'EXPERT']}
            value={formData.difficulty}
            onChange={(value) => setFormData({ ...formData, difficulty: (value as Difficulty) || 'EASY' })}
            classNames={{
              input: styles.input,
              label: styles.label,
              dropdown: styles.dropdown,
              option: styles.option
            }}
            className={styles.formGroup}
          />
          <Select
            label="Type"
            placeholder="Sélectionnez un type"
            data={['URL', 'IMAGE', 'FILE']}
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: (value as 'URL' | 'IMAGE' | 'FILE') || 'URL' })}
            classNames={{
              input: styles.input,
              label: styles.label,
              dropdown: styles.dropdown,
              option: styles.option
            }}
            className={styles.formGroup}
          />
          {formData.type === 'URL' && (
            <TextInput
              label="URL"
              placeholder="Entrez l'URL du challenge"
              value={formData.url}
              onChange={(event) => setFormData({ ...formData, url: event.currentTarget.value })}
              classNames={{
                input: styles.input,
                label: styles.label
              }}
              className={styles.formGroup}
            />
          )}
          {(formData.type === 'IMAGE' || formData.type === 'FILE') && (
            <FileInput
              label={formData.type === 'IMAGE' ? "Image du challenge" : "Fichier du challenge"}
              placeholder={formData.type === 'IMAGE' ? "Sélectionnez une image" : "Sélectionnez un fichier"}
              accept={formData.type === 'IMAGE' ? "image/*" : undefined}
              value={formData.file}
              onChange={(file) => {
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const base64String = e.target?.result as string;
                    // Enlever le préfixe "data:image/jpeg;base64," pour ne garder que la partie base64
                    const base64Content = base64String.split(',')[1];
                    setFormData({ 
                      ...formData, 
                      file: file,
                      imageb64: formData.type === 'IMAGE' ? base64Content : undefined
                    });
                  };
                  reader.readAsDataURL(file);
                } else {
                  setFormData({
                    ...formData,
                    file: null,
                    imageb64: undefined
                  });
                }
              }}
              classNames={{
                input: styles.input,
                label: styles.label
              }}
              className={styles.formGroup}
            />
          )}
          <div>
            <Text className={styles.label}>Ressources additionnelles</Text>
            {formData.resources.map((resource, index) => (
              <div key={index} className={styles.resourceGroup}>
                <Select
                  placeholder="Type"
                  data={['LINK', 'FILE']}
                  value={resource.type}
                  onChange={(value) => {
                    const newResources = [...formData.resources];
                    newResources[index].type = (value as 'LINK' | 'FILE') || 'LINK';
                    setFormData({ ...formData, resources: newResources });
                  }}
                  classNames={{
                    input: styles.input,
                    dropdown: styles.dropdown,
                    option: styles.option
                  }}
                  className={styles.resourceTypeSelect}
                />
                <TextInput
                  placeholder={resource.type === 'LINK' ? "URL de la ressource" : "Nom du fichier"}
                  value={resource.value}
                  onChange={(event) => {
                    const newResources = [...formData.resources];
                    newResources[index].value = event.currentTarget.value;
                    setFormData({ ...formData, resources: newResources });
                  }}
                  classNames={{
                    input: styles.input
                  }}
                  className={styles.resourceInput}
                />
                <ActionIcon color="red" onClick={() => {
                  const newResources = formData.resources.filter((_, i) => i !== index);
                  setFormData({ ...formData, resources: newResources });
                }}>
                  <FontAwesomeIcon icon={faTrash} size="sm" />
                </ActionIcon>
              </div>
            ))}
            <Button onClick={() => {
              setFormData({
                ...formData,
                resources: [...formData.resources, { type: 'LINK', value: '' }]
              });
            }} variant="outline" color="blue" mt="sm">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Ajouter une ressource
            </Button>
          </div>
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSubmit}
              size="md"
              className={styles.submitButton}
            >
              {editingChallenge ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ChallengeManagement; 