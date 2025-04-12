import { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Paper, Text, Grid, Card, MantineProvider, Skeleton } from '@mantine/core';
import axios from 'axios';

// Chargement paresseux des composants
const UserManagement = lazy(() => import('../components/UserManagement'));
const CategoryManagement = lazy(() => import('../components/CategoryManagement'));
const ChallengeManagement = lazy(() => import('../components/ChallengeManagement'));

interface AdminPageProps {}

interface Stats {
  totalUsers: number;
  totalChallenges: number;
  totalCategories: number;
  activeUsers: number;
  completionRate: number;
}

interface CachedData {
  data: any;
  timestamp: number;
}

// Cache des données avec une durée de validité de 5 minutes
const cache: { [key: string]: CachedData } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchWithCache = async (url: string) => {
  const cachedData = cache[url];
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  const response = await axios.get(url);
  cache[url] = {
    data: response.data,
    timestamp: now
  };
  return response.data;
};

export default function AdminPage({}: AdminPageProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'challenges' | 'categories'>('users');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalChallenges: 0,
    totalCategories: 0,
    activeUsers: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, categoriesData] = await Promise.all([
          fetchWithCache(`${import.meta.env.VITE_API_URL}/admin/stats`),
          fetchWithCache(`${import.meta.env.VITE_API_URL}/categories`)
        ]);
        
        setStats(statsData);
        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Rediriger si l'utilisateur n'est pas administrateur
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const renderStats = () => (
    <Grid className="mb-8">
      <Grid.Col span={4}>
        <Card className="bg-gray-800 text-white">
          <div className="flex flex-col">
            <Text c="dimmed" size="xs">Utilisateurs totaux</Text>
            {loading ? (
              <Skeleton height={30} width={60} />
            ) : (
              <>
                <Text fw={700} size="xl">{stats.totalUsers}</Text>
              </>
            )}
          </div>
        </Card>
      </Grid.Col>
      <Grid.Col span={4}>
        <Card className="bg-gray-800 text-white">
          <div className="flex flex-col">
            <Text c="dimmed" size="xs">Challenges</Text>
            {loading ? (
              <Skeleton height={30} width={60} />
            ) : (
              <>
                <Text fw={700} size="xl">{stats.totalChallenges}</Text>
              </>
            )}
          </div>
        </Card>
      </Grid.Col>
      <Grid.Col span={4}>
        <Card className="bg-gray-800 text-white">
          <div className="flex flex-col">
            <Text c="dimmed" size="xs">Catégories</Text>
            {loading ? (
              <Skeleton height={30} width={60} />
            ) : (
              <Text fw={700} size="xl">{stats.totalCategories}</Text>
            )}
          </div>
        </Card>
      </Grid.Col>
    </Grid>
  );

  return (
    <MantineProvider>
      <div className="flex min-h-screen bg-gray-900">
        <Navbar
          categories={categories}
          loading={false}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">Administration</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    // Vider le cache lors de l'actualisation
                    Object.keys(cache).forEach(key => delete cache[key]);
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  <i className="fas fa-sync-alt mr-2" />
                  Actualiser
                </button>
              </div>
            </div>

            {/* Dashboard des statistiques */}
            {renderStats()}

            {/* Navigation par onglets */}
            <Paper className="bg-gray-800 mb-6 p-2 rounded-lg">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'users'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <i className="fas fa-users mr-2" />
                  Utilisateurs
                </button>
                <button
                  onClick={() => setActiveTab('challenges')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'challenges'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <i className="fas fa-flag mr-2" />
                  Challenges
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'categories'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <i className="fas fa-folder mr-2" />
                  Catégories
                </button>
              </div>
            </Paper>

            {/* Contenu des onglets */}
            <Paper className="bg-gray-800 p-6 rounded-lg">
              <Suspense fallback={<div className="w-full h-64 flex items-center justify-center"><Skeleton height={400} radius="md" /></div>}>
                {activeTab === 'users' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-white">Gestion des utilisateurs</h2>
                    </div>
                    <UserManagement />
                  </div>
                )}

                {activeTab === 'challenges' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-white">Gestion des challenges</h2>
                      <button 
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        onClick={() => {
                          const event = new CustomEvent('openChallengeModal');
                          window.dispatchEvent(event);
                        }}
                      >
                        <i className="fas fa-plus mr-2" />
                        Créer un challenge
                      </button>
                    </div>
                    <ChallengeManagement />
                  </div>
                )}

                {activeTab === 'categories' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-white">Gestion des catégories</h2>
                      <button 
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        onClick={() => {
                          const event = new CustomEvent('openCategoryModal');
                          window.dispatchEvent(event);
                        }}
                      >
                        <i className="fas fa-plus mr-2" />
                        Créer une catégorie
                      </button>
                    </div>
                    <CategoryManagement />
                  </div>
                )}
              </Suspense>
            </Paper>
          </div>
        </div>
      </div>
    </MantineProvider>
  );
} 