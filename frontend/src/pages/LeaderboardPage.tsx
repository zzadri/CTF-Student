import { useState, useEffect, KeyboardEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

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

interface LeaderboardUser {
  id: string;
  username: string;
  avatar: string;
  score: number;
  challengesCompleted: number;
  recentAchievements: Array<{
    challengeName: string;
    points: number;
    category: string;
    completedAt: string;
  }>;
  rank?: number;
}

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardUser[];
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, categoriesResponse] = await Promise.all([
          axios.get<LeaderboardResponse>(`${API_URL}/users/leaderboard`),
          axios.get(`${API_URL}/categories`)
        ]);

        if (usersResponse.data.success) {
          // Ajouter le rang aux utilisateurs
          const rankedUsers = usersResponse.data.data.map((user, index) => ({
            ...user,
            rank: index + 1
          }));
          setUsers(rankedUsers);
        }

        if (Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        } else if (categoriesResponse.data.data) {
          setCategories(categoriesResponse.data.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUserClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, userId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleUserClick(userId);
    }
  };

  const getTopThreeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-700';
      default:
        return 'bg-gray-800/50';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">
            <i className="fas fa-spinner fa-spin text-4xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Navbar 
        categories={categories}
        loading={loading}
        selectedCategory={selectedCategory}
        onCategorySelect={(id) => setSelectedCategory(id)}
      />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Podium */}
          <div className="flex justify-center items-end mb-12 space-x-4">
            {users.slice(0, 3).map((user, index) => (
              <button
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                onKeyDown={(e) => handleKeyDown(e, user.id)}
                className="flex flex-col items-center cursor-pointer transform hover:scale-105 transition-transform bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg"
                aria-label={`Voir le profil de ${user.username}, classé ${index + 1}`}
              >
                <img
                  src={user.avatar || '/default-avatar.png'}
                  alt={`Avatar de ${user.username}`}
                  className="w-16 h-16 rounded-full mb-2 border-2 border-yellow-500"
                />
                <div className={`w-24 py-4 px-2 rounded-t-lg text-center ${
                  index === 0 ? 'bg-yellow-500 h-32' :
                  index === 1 ? 'bg-gray-400 h-24' :
                  'bg-yellow-700 h-20'
                }`}>
                  <span className="text-white font-bold">{user.username}</span>
                  <div className="text-white text-sm">{user.score} pts</div>
                </div>
              </button>
            ))}
          </div>

          {/* Tableau de classement */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rang</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joueur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Challenges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user, index) => (
                  <tr 
                    key={user.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleUserClick(user.id)}
                    onKeyDown={(e) => handleKeyDown(e, user.id)}
                    className="hover:bg-gray-700 cursor-pointer transition-colors focus:outline-none focus:bg-gray-700"
                    aria-label={`Voir le profil de ${user.username}, classé ${index + 1}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.avatar || '/default-avatar.png'}
                          alt={`Avatar de ${user.username}`}
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="ml-4 text-white">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {user.score} points
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {user.challengesCompleted} validés
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 