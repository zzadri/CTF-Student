import { useState, useEffect, Suspense, lazy, useRef } from 'react';
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

export default function AdminPage() {
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
  
  // Références pour savoir quels onglets ont été chargés
  const loadedTabs = useRef<Set<string>>(new Set(['users']));
  
  // Fonction pour marquer un onglet comme chargé
  const markTabAsLoaded = (tab: string) => {
    loadedTabs.current.add(tab);
  };

  // État pour contrôler si les onglets sont initialisés ou non
  const [tabsInitialized, setTabsInitialized] = useState<{
    users: boolean;
    challenges: boolean;
    categories: boolean;
  }>({
    users: true, // L'onglet par défaut est toujours initialisé
    challenges: false,
    categories: false,
  });

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

  // Lorsque l'onglet actif change, initialiser cet onglet s'il ne l'est pas déjà
  useEffect(() => {
    if (!tabsInitialized[activeTab]) {
      setTabsInitialized(prev => ({
        ...prev,
        [activeTab]: true
      }));
      markTabAsLoaded(activeTab);
    }
  }, [activeTab, tabsInitialized]);

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
              <Text fw={700} size="xl">{stats.totalUsers}</Text>
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
              <Text fw={700} size="xl">{stats.totalChallenges}</Text>
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
                  className="px-4 py-2 bg-blue-600/80 text-white rounded hover:bg-blue-700/90 transition-colors flex items-center space-x-2"
                >
                  <i className="fas fa-sync-alt" />
                  <span>Actualiser</span>
                </button>
              </div>
            </div>

            {/* Dashboard des statistiques */}
            {renderStats()}

            {/* Navigation par onglets */}
            <Paper className="bg-gray-800 mb-6 p-2 rounded">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    activeTab === 'users'
                      ? 'bg-blue-600/90 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <i className="fas fa-users mr-2"></i>
                  Utilisateurs
                </button>
                <button
                  onClick={() => setActiveTab('challenges')}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    activeTab === 'challenges'
                      ? 'bg-blue-600/90 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <i className="fas fa-flag mr-2"></i>
                  Challenges
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    activeTab === 'categories'
                      ? 'bg-blue-600/90 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <i className="fas fa-folder mr-2"></i>
                  Catégories
                </button>
              </div>
            </Paper>

            {/* Contenu des onglets */}
            <Paper className="bg-gray-800 p-6 rounded-lg">
              <div className="relative">
                {/* Utilisateurs */}
                <div style={{ display: activeTab === 'users' ? 'block' : 'none' }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      Gestion des utilisateurs
                    </h2>
                  </div>
                  {tabsInitialized.users && (
                    <Suspense fallback={<div className="w-full h-64 flex items-center justify-center"><Skeleton height={400} radius="md" /></div>}>
                      <UserManagement />
                    </Suspense>
                  )}
                </div>

                {/* Challenges */}
                <div style={{ display: activeTab === 'challenges' ? 'block' : 'none' }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      Gestion des challenges
                    </h2>
                    <button 
                      className="px-4 py-2 bg-blue-600/80 text-white rounded hover:bg-blue-700/90 transition-colors flex items-center space-x-2"
                      onClick={() => {
                        const event = new CustomEvent('openChallengeModal');
                        window.dispatchEvent(event);
                      }}
                    >
                      <i className="fas fa-plus" />
                      <span>Créer un challenge</span>
                    </button>
                  </div>
                  {tabsInitialized.challenges && (
                    <Suspense fallback={<div className="w-full h-64 flex items-center justify-center"><Skeleton height={400} radius="md" /></div>}>
                      <ChallengeManagement />
                    </Suspense>
                  )}
                </div>

                {/* Catégories */}
                <div style={{ display: activeTab === 'categories' ? 'block' : 'none' }}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      Gestion des catégories
                    </h2>
                    <button 
                      className="px-4 py-2 bg-blue-600/80 text-white rounded hover:bg-blue-700/90 transition-colors flex items-center space-x-2"
                      onClick={() => {
                        const event = new CustomEvent('openCategoryModal');
                        window.dispatchEvent(event);
                      }}
                    >
                      <i className="fas fa-plus" />
                      <span>Nouvelle catégorie</span>
                    </button>
                  </div>
                  {tabsInitialized.categories && (
                    <Suspense fallback={<div className="w-full h-64 flex items-center justify-center"><Skeleton height={400} radius="md" /></div>}>
                      <CategoryManagement />
                    </Suspense>
                  )}
                </div>
              </div>
            </Paper>
          </div>
        </div>
      </div>
    </MantineProvider>
  );
} 