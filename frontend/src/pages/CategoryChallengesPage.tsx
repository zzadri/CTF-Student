import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { LoadingOverlay, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFlag } from '@fortawesome/free-solid-svg-icons';
import { apiService, Category, Challenge } from '../services/api.service';

export default function CategoryChallengesPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryId ?? null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const categoryData = await apiService.getCategories();
        setCategories(categoryData);

        if (categoryId) {
          const categoryDetails = await apiService.getCategory(categoryId);
          setCategory(categoryDetails);

          const challengesList = await apiService.getChallenges({ categoryId });
          const filteredChallenges = challengesList.filter((challenge: Challenge) => challenge.categoryId === categoryId);
          setChallenges(filteredChallenges);
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

  // Réinitialiser les challenges à chaque changement de catégorie
  useEffect(() => {
    if (categoryId !== selectedCategory) {
      setChallenges([]);
      setSelectedCategory(categoryId ?? null);
    }
  }, [categoryId, selectedCategory]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(`/categories/${categoryId}`);
  };

  // Fonction utilitaire pour générer le badge de difficulté avec la bonne couleur
  const getDifficultyBadge = (difficulty: string) => {
    let bgColorClass = '';
    
    if (difficulty === 'EZ') {
      bgColorClass = 'bg-green-600';
    } else if (difficulty === 'EASY') {
      bgColorClass = 'bg-teal-600';
    } else if (difficulty === 'NORMAL') {
      bgColorClass = 'bg-yellow-600';
    } else if (difficulty === 'HARD') {
      bgColorClass = 'bg-orange-600';
    } else {
      bgColorClass = 'bg-red-600';
    }
    
    return (
      <div className={`text-white px-3 py-1 rounded text-sm font-medium ${bgColorClass}`}>
        {difficulty}
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
                <i className={`fas ${category.icon ?? 'fa-folder'} text-4xl ${category.color?.replace('bg-', 'text-') ?? 'text-blue-500'}`}></i>
                <div>
                  <h1 className="text-4xl font-bold text-white">{category.name}</h1>
                  <p className="text-gray-400 mt-2">
                    {category.description ?? `Cette série d'épreuves vous confronte à des challenges de ${category.name}.`}
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
                <button 
                  key={challenge.id}
                  className="relative cursor-pointer bg-gray-800 rounded overflow-hidden shadow-md hover:bg-gray-700/80 transition-all text-left w-full block"
                  onClick={() => navigate(`/challenges/${challenge.id}`)}
                  aria-label={`Voir le challenge ${challenge.title}`}
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1.5" style={{ backgroundColor: challenge.category.color ?? '#ff4444' }}></div>
                  <div className="p-5 pl-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">{challenge.title}</h3>
                      
                      <div className="flex items-center gap-2">
                        {getDifficultyBadge(challenge.difficulty)}
                        <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
                          {challenge.points} PTS
                        </div>
                        <div className="bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center gap-1">
                          <FontAwesomeIcon icon={faFlag} />
                          <span>{challenge.solvedBy?._count ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 