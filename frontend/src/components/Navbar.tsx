import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

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

interface NavbarProps {
  categories: Category[];
  loading: boolean;
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
}

export function Navbar({ categories, loading, selectedCategory, onCategorySelect }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getIconColor = (color: string | null) => {
    return color?.replace('bg-', 'text-') || 'text-gray-300';
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col justify-between">
      {/* Navigation principale */}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-8">CTF</h2>
        <div className="space-y-4">
          <Link to="/" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <i className="fas fa-home mr-2"></i>
            Accueil
          </Link>
          <Link to="/leaderboard" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <i className="fas fa-trophy mr-2"></i>
            Classement
          </Link>
          <div className="relative">
            <button 
              className="flex items-center p-2 hover:bg-gray-700 rounded w-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className="fas fa-flag mr-2"></i>
              Challenges
              <i className={`fas fa-chevron-right ml-auto transition-transform ${isMenuOpen ? 'rotate-90' : ''}`}></i>
            </button>
            
            {/* Menu déroulant des catégories */}
            <div 
              className={`absolute left-full top-0 ml-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50 transition-all duration-200 ${
                isMenuOpen ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible -translate-x-2'
              }`}
            >
              <div className="px-4 py-2 text-sm font-semibold text-gray-400 border-b border-gray-700">
                Catégories
              </div>
              {loading ? (
                <div className="px-4 py-2 text-sm text-gray-400">
                  Chargement...
                </div>
              ) : categories.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-400">
                  Aucune catégorie disponible
                </div>
              ) : (
                categories.map((category) => (
                  <button 
                    key={category.id}
                    onClick={() => onCategorySelect(category.id)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${
                      selectedCategory === category.id ? 'bg-gray-700 text-white' : 'text-gray-300'
                    }`}
                  >
                    <i className={`fas ${category.icon || 'fa-folder'} mr-2 ${getIconColor(category.color)}`}></i>
                    {category.name}
                    <span className="ml-2 text-xs text-gray-500">
                      ({category._count?.challenges || 0})
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section utilisateur */}
      <div className="p-4 border-t border-gray-700">
        <Link to="/profile" className="block">
          <div className="flex items-center mb-4 hover:bg-gray-700 p-2 rounded">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={`Avatar de ${user.username}`}
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                <i className="fas fa-user text-gray-300"></i>
              </div>
            )}
            <div>
              <p className="font-medium truncate max-w-[120px]">{user?.username || 'Utilisateur'}</p>
              <p className="text-sm text-gray-400">Participant</p>
            </div>
          </div>
        </Link>
        <button
          onClick={logout}
          className="flex items-center p-2 hover:bg-gray-700 rounded w-full text-left text-red-400"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          Déconnexion
        </button>
      </div>
    </div>
  );
} 