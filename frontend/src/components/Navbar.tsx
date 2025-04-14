import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { NotificationCenter } from './NotificationCenter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faTrophy, faFlag, faChevronRight, faShieldAlt, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

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

  const renderCategoriesContent = () => {
    if (loading) {
      return (
        <div className="px-4 py-2 text-sm text-gray-400">
          Chargement...
        </div>
      );
    }

    if (categories.length === 0) {
      return (
        <div className="px-4 py-2 text-sm text-gray-400">
          Aucune catégorie disponible
        </div>
      );
    }

    return categories.map((category) => (
      <button 
        key={category.id}
        onClick={() => onCategorySelect(category.id)}
        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${
          selectedCategory === category.id ? 'bg-gray-700 text-white' : 'text-gray-300'
        }`}
      >
        <i className={`fas ${category.icon || 'fa-folder'} ${getIconColor(category.color)}`} />{' '}
        {category.name}{' '}
        <span className="text-xs text-gray-500">
          ({category._count?.challenges || 0})
        </span>
      </button>
    ));
  };

  const renderUserAvatar = () => {
    if (user?.avatar) {
      return (
        <img 
          src={user.avatar} 
          alt={`Avatar de ${user.username}`}
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
      );
    }
    
    return (
      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
        <FontAwesomeIcon icon={faUser} className="text-gray-300" />
      </div>
    );
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col justify-between">
      {/* Navigation principale */}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-8">CTF</h2>
        <div className="space-y-4">
          <Link to="/" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            Accueil
          </Link>
          <Link to="/leaderboard" className="flex items-center p-2 hover:bg-gray-700 rounded">
            <FontAwesomeIcon icon={faTrophy} className="mr-2" />
            Classement
          </Link>
          <div className="relative">
            <button 
              className="flex items-center p-2 hover:bg-gray-700 rounded w-full"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <FontAwesomeIcon icon={faFlag} className="mr-2" />
              Challenges
              <FontAwesomeIcon 
                icon={faChevronRight} 
                className={`ml-auto transition-transform ${isMenuOpen ? 'rotate-90' : ''}`} 
              />
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
              {renderCategoriesContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Section utilisateur */}
      <div className="p-4 border-t border-gray-700">
        {user?.role === 'ADMIN' && (
          <Link 
            to="/admin" 
            className="flex items-center p-2 mb-4 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
          >
            <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
            Administration
          </Link>
        )}
        <div className="flex items-center justify-between mb-4">
          <Link to="/profile" className="flex-1">
            <div className="flex items-center hover:bg-gray-700 p-2 rounded">
              {renderUserAvatar()}
              <div>
                <p className="font-medium truncate max-w-[120px]">{user?.username || 'Utilisateur'}</p>
                <p className="text-sm text-gray-400">{user?.role === 'ADMIN' ? 'Administrateur' : 'Participant'}</p>
              </div>
            </div>
          </Link>
          <NotificationCenter />
        </div>
        <button
          onClick={logout}
          className="flex items-center p-2 hover:bg-gray-700 rounded w-full text-left text-red-400"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Déconnexion
        </button>
      </div>
    </div>
  );
} 