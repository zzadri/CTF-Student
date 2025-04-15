import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { apiService, Category } from '../services/api.service';
import { usersService, PublicProfile as UserProfile } from '../services/users.service';
import type { Challenge, Badge, PublicProfile as IPublicProfile } from '../types/profile.types';

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          setError('ID utilisateur non spécifié');
          return;
        }

        const [profileData, categoriesData] = await Promise.all([
          usersService.getPublicProfile(userId),
          apiService.getCategories()
        ]);

        setProfile(profileData);
        setCategories(categoriesData);
      } catch (error) {
        setError('Erreur lors du chargement du profil');
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">
            <i className="fas fa-spinner fa-spin text-4xl"></i>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">
            {error || 'Profil non trouvé'}
          </div>
        </div>
      </div>
    );
  }

  // Calculer le niveau en fonction du score
  const level = Math.floor(profile.score / 1000) + 1;
  const progress = (profile.score % 1000) / 10; // Pourcentage jusqu'au prochain niveau

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Navbar 
        categories={categories}
        loading={loadingCategories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* En-tête du profil avec niveau */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={profile.avatar || '/default-avatar.png'}
                    alt={`Avatar de ${profile.username}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-cyan-500"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-cyan-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">#{profile.rank}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">{profile.username}</h1>
                    <p className="text-gray-400">Niveau {level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-400">{profile.score} points</p>
                    <p className="text-gray-400">{profile.solvedChallenges.total} challenges validés</p>
                  </div>
                </div>
                
                {/* Barre de progression */}
                <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                  <div 
                    className="bg-cyan-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Langue préférée</div>
                    <div className="text-white text-xl font-bold">{profile.language}</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">Position</div>
                    <div className="text-white text-xl font-bold">#{profile.rank}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Derniers challenges validés */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Derniers challenges validés</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3">Challenge</th>
                    <th className="pb-3">Catégorie</th>
                    <th className="pb-3">Points</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.solvedChallenges.recent.map((challenge) => (
                    <tr key={challenge.id} className="border-b border-gray-700">
                      <td className="py-3 text-white">{challenge.name}</td>
                      <td className="py-3">
                        <span className="px-3 py-1 rounded-full text-sm bg-cyan-500/10 text-cyan-400">
                          {challenge.category}
                        </span>
                      </td>
                      <td className="py-3 text-white">+{challenge.points}</td>
                      <td className="py-3 text-gray-400">
                        {new Date(challenge.solvedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 