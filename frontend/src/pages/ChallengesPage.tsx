import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navbar } from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

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

export default function ChallengesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(`/categories/${categoryId}`);
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
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-8 text-white">
            <h1 className="text-4xl font-bold mb-4">Challenges</h1>
          </div>

          {/* Grille des catégories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center text-gray-400">
                <i className="fas fa-spinner fa-spin text-4xl"></i>
                <p className="mt-4">Chargement des catégories...</p>
              </div>
            ) : (
              categories.map((category) => (
                <div 
                  key={category.id}
                  className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/categories/${category.id}`)}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <i className={`fas ${category.icon || 'fa-folder'} text-xl ${category.color?.replace('bg-', 'text-') || 'text-blue-500'}`}></i>
                      <div>
                        <h3 className="text-white font-medium">{category.name}</h3>
                        <span className="text-sm text-cyan-400">{category._count?.challenges || 0} épreuves</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {category.description || `Cette série d'épreuves vous confronte à des challenges de ${category.name}.`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 