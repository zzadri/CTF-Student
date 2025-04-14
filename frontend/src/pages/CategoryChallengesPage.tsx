import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { LoadingOverlay, Badge, Button, Paper, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock, faFlag, faCheck } from '@fortawesome/free-solid-svg-icons';

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
  };
  isSolved?: boolean;
  solvedBy?: {
    _count: number;
  };
}

export default function CategoryChallengesPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId || null);

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
        
        if (categoryId) {
          // Récupérer les détails de la catégorie spécifique
          const categoryResponse = await axios.get(`${API_URL}/categories/${categoryId}`);
          const categoryDetails = categoryResponse.data.data || categoryResponse.data;
          setCategory(categoryDetails);
          
          // Récupérer les challenges de cette catégorie
          const challengesResponse = await axios.get(`${API_URL}/challenges?categoryId=${categoryId}`);
          const challengesList = challengesResponse.data.data || challengesResponse.data;
          setChallenges(challengesList);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Impossible de charger les challenges de cette catégorie',
          color: 'red'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(`/categories/${categoryId}`);
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

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar 
        categories={categories}
        loading={loading}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <LoadingOverlay visible={loading} />
        
        <div className="max-w-7xl mx-auto">
          {/* En-tête avec navigation */}
          <div className="mb-8">
            <Button 
              variant="subtle" 
              color="gray" 
              leftSection={<FontAwesomeIcon icon={faArrowLeft} />}
              onClick={() => navigate('/challenges')}
              className="mb-4"
            >
              Retour aux catégories
            </Button>
            
            {category && (
              <div className="flex items-center gap-4 mb-6">
                <i className={`fas ${category.icon || 'fa-folder'} text-4xl ${category.color?.replace('bg-', 'text-') || 'text-blue-500'}`}></i>
                <div>
                  <h1 className="text-4xl font-bold text-white">{category.name}</h1>
                  <p className="text-gray-400 mt-2">
                    {category.description || `Cette série d'épreuves vous confronte à des challenges de ${category.name}.`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Liste des challenges */}
          {!loading && challenges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-xl">
                Aucun challenge disponible dans cette catégorie.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {challenges.map((challenge) => (
                <div 
                  key={challenge.id}
                  className="relative cursor-pointer bg-gray-800 rounded overflow-hidden shadow-md hover:bg-gray-700/80 transition-all"
                  onClick={() => navigate(`/challenges/${challenge.id}`)}
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1.5" style={{ backgroundColor: challenge.category.color || '#ff4444' }}></div>
                  <div className="p-5 pl-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
                      
                      <div className="flex items-center gap-2">
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
                          <span>{challenge.solvedBy?._count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 