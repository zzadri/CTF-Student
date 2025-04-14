import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { LoadingOverlay, Badge, Button, Paper, TextInput, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFlag, faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  _count: {
    challenges: number;
  };
}

interface Resource {
  id: string;
  type: 'LINK' | 'FILE';
  value: string;
  name?: string;
}

interface Challenge {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  difficulty: 'EZ' | 'EASY' | 'NORMAL' | 'HARD' | 'EXPERT';
  points: number;
  categoryId: string;
  category: {
    name: string;
    color: string;
    icon?: string;
  };
  resources: Resource[];
  isSolved?: boolean;
  solvedBy?: {
    _count: number;
  };
  type: 'URL' | 'FILE' | 'IMAGE';
  url?: string;
  imageb64?: string;
}

export default function ChallengePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [flagInput, setFlagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Récupérer toutes les catégories pour la barre de navigation
        const categoriesResponse = await axios.get(`${API_URL}/categories`);
        let categoryData = [];
        if (Array.isArray(categoriesResponse.data)) {
          categoryData = categoriesResponse.data;
        } else if (categoriesResponse.data.data && Array.isArray(categoriesResponse.data.data)) {
          categoryData = categoriesResponse.data.data;
        }
        setCategories(categoryData);
        
        if (id) {
          // Récupérer les détails du challenge
          const challengeResponse = await axios.get(`${API_URL}/challenges/${id}`);
          const challengeDetails = challengeResponse.data.data || challengeResponse.data;
          setChallenge(challengeDetails);
          
          if (challengeDetails?.categoryId) {
            setSelectedCategory(challengeDetails.categoryId);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de charger les détails du challenge',
          color: 'red'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(`/categories/${categoryId}`);
  };

  const handleSubmitFlag = async () => {
    if (!flagInput.trim() || !id) return;
    
    try {
      setSubmitting(true);
      
      const response = await axios.post(`${API_URL}/challenges/${id}/verify`, {
        flag: flagInput
      });
      
      if (response.data.success) {
        notifications.show({
          title: 'Bravo!',
          message: 'Flag correct! Vous avez résolu ce challenge.',
          color: 'green'
        });
        
        // Mettre à jour le statut du challenge comme résolu
        setChallenge(prev => prev ? { ...prev, isSolved: true } : null);
      } else {
        notifications.show({
          title: 'Incorrect',
          message: 'Le flag soumis n\'est pas correct. Essayez encore!',
          color: 'red'
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la vérification du flag',
        color: 'red'
      });
    } finally {
      setSubmitting(false);
    }
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

  const renderResources = () => {
    if (!challenge?.resources || challenge.resources.length === 0) {
      return <p className="text-gray-400">Aucune ressource disponible</p>;
    }

    return (
      <div className="space-y-2">
        {challenge.resources.map((resource) => (
          <div key={resource.id}>
            {resource.type === 'LINK' ? (
              <a 
                href={resource.value} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 hover:underline block truncate"
              >
                {resource.name || resource.value}
              </a>
            ) : (
              <a 
                href={`${API_URL}/challenges/resources/${resource.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 hover:underline block truncate"
              >
                {resource.name || 'Télécharger le fichier'}
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar 
        categories={categories}
        loading={loading}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <LoadingOverlay visible={loading} />
        
        <div className="max-w-5xl mx-auto">
          {/* Navigation */}
          <Button 
            variant="subtle" 
            color="gray" 
            leftSection={<FontAwesomeIcon icon={faArrowLeft} />}
            onClick={() => navigate(challenge ? `/categories/${challenge.categoryId}` : '/challenges')}
            className="mb-6"
          >
            Retour aux challenges
          </Button>
          
          {challenge && (
            <>
              {/* En-tête du challenge */}
              <div className="mb-6">
                <div className="bg-gray-800 rounded-lg shadow-lg border-l-4 p-6" style={{ borderLeftColor: challenge.category.color || '#ff4444' }}>
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-white">{challenge.title}</h1>
                      {challenge.subtitle && (
                        <p className="text-gray-300 mt-2">{challenge.subtitle}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div 
                        className={`text-white px-3 py-1 rounded text-sm font-medium ${
                          challenge.difficulty === 'EZ' ? 'bg-green-600' :
                          challenge.difficulty === 'EASY' ? 'bg-teal-600' :
                          challenge.difficulty === 'NORMAL' ? 'bg-yellow-600' :
                          challenge.difficulty === 'HARD' ? 'bg-orange-600' :
                          'bg-red-600'
                        }`}
                      >
                        {challenge.difficulty}
                      </div>
                      <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
                        {challenge.points} PTS
                      </div>
                      <div className="bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1">
                        <FontAwesomeIcon icon={faFlag} />
                        <span>{challenge.solvedBy?._count || 0} résolutions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Structure simplifiée en deux colonnes principales */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Colonne principale */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Description */}
                  <Paper className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
                    <div className="text-gray-300 prose prose-invert max-w-none">
                      {challenge.description.split('\n').map((paragraph, idx) => (
                        paragraph.trim() ? <p key={idx} className="mb-3 last:mb-0">{paragraph}</p> : <br key={idx} />
                      ))}
                    </div>
                  </Paper>

                  {/* Zone de soumission du flag */}
                  <Paper className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      {challenge.isSolved ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <FontAwesomeIcon icon={faUnlock} />
                          <span>Challenge résolu!</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faLock} />
                          <span>Soumettre un flag</span>
                        </div>
                      )}
                    </h2>
                    
                    <div className="flex gap-2">
                      <TextInput
                        placeholder="CTF{flag}"
                        value={flagInput}
                        onChange={(e) => setFlagInput(e.currentTarget.value)}
                        className="flex-1"
                        disabled={challenge.isSolved || submitting}
                      />
                      <Button 
                        color="blue" 
                        onClick={handleSubmitFlag}
                        loading={submitting}
                        disabled={challenge.isSolved}
                      >
                        Valider
                      </Button>
                    </div>
                    
                    {challenge.isSolved && (
                      <Text className="mt-4 text-green-400">
                        Bravo! Vous avez déjà résolu ce challenge.
                      </Text>
                    )}
                  </Paper>
                </div>

                {/* Colonne latérale */}
                <div className="lg:col-span-4">
                  {/* Accès au challenge */}
                  {challenge.type === 'URL' && challenge.url && (
                    <Paper className="bg-gray-800 p-6 rounded-lg mb-6">
                      <h2 className="text-xl font-semibold text-white mb-4">Accéder au Challenge</h2>
                      <Button
                        fullWidth
                        color="blue"
                        component="a"
                        href={challenge.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="md"
                      >
                        Démarrer le challenge
                      </Button>
                    </Paper>
                  )}

                  {/* Image pour les challenges de type IMAGE */}
                  {challenge.type === 'IMAGE' && (
                    <Paper className="bg-gray-800 p-6 rounded-lg mb-6">
                      <h2 className="text-xl font-semibold text-white mb-4">Image du Challenge</h2>
                      <div className="rounded-md overflow-hidden border border-gray-700">
                        {challenge.imageb64 ? (
                          <img 
                            src={`data:image/jpeg;base64,${challenge.imageb64}`}
                            alt="Image du challenge" 
                            className="w-full h-auto"
                          />
                        ) : challenge.resources && challenge.resources.length > 0 ? (
                          <img 
                            src={`${API_URL}/challenges/resources/${challenge.resources[0].id}`}
                            alt="Image du challenge" 
                            className="w-full h-auto"
                          />
                        ) : (
                          <div className="p-4 text-center text-gray-400">
                            Aucune image disponible
                          </div>
                        )}
                      </div>
                    </Paper>
                  )}

                  {/* Ressources */}
                  <Paper className="bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-white mb-4">Ressources</h2>
                    {renderResources()}
                  </Paper>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 