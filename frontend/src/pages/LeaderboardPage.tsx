import { useState, useEffect } from 'react';
import axios from 'axios';
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

export function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  return (
    <div className="flex h-screen bg-gray-900">
      <Navbar 
        categories={categories}
        loading={loading}
        selectedCategory={selectedCategory}
        onCategorySelect={(id) => setSelectedCategory(id)}
      />

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Classement</h1>

          {/* Top 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {users.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className={`${getTopThreeClass(user.rank || 0)} rounded-lg p-6 text-center transform hover:scale-105 transition-transform`}
              >
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full bg-gray-700 mx-auto mb-4 overflow-hidden">
                    <img 
                      src={user.avatar} 
                      alt={`Avatar de ${user.username}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://api.dicebear.com/7.x/avataaars/svg";
                      }}
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">#{user.rank}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{user.username}</h3>
                <p className="text-cyan-400 font-medium">{user.score} points</p>
                <p className="text-sm text-gray-300">{user.challengesCompleted} challenges complétés</p>
                {user.recentAchievements.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Derniers succès :</p>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {user.recentAchievements.map((achievement, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <span>{achievement.challengeName}</span>
                          <span className="text-cyan-400">+{achievement.points}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Liste des autres joueurs */}
          <div className="bg-gray-800/30 rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 text-gray-400 font-medium border-b border-gray-700">
              <div className="col-span-1 text-center">Rang</div>
              <div className="col-span-5">Joueur</div>
              <div className="col-span-3 text-center">Points</div>
              <div className="col-span-3 text-center">Challenges</div>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-4xl text-cyan-400"></i>
                <p className="mt-4 text-gray-400">Chargement du classement...</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {users.slice(3).map((user) => (
                  <div 
                    key={user.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="col-span-1 text-center font-medium text-gray-500">
                      #{user.rank}
                    </div>
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                        <img 
                          src={user.avatar} 
                          alt={`Avatar de ${user.username}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://api.dicebear.com/7.x/avataaars/svg";
                          }}
                        />
                      </div>
                      <span className="text-white">{user.username}</span>
                    </div>
                    <div className="col-span-3 text-center text-cyan-400">
                      {user.score} points
                    </div>
                    <div className="col-span-3 text-center text-gray-300">
                      {user.challengesCompleted} challenges
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 