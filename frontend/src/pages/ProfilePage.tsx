import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notifications } from '@mantine/notifications';
import { toast } from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { apiService, Category } from '../services/api.service';
import { usersService, Language } from '../services/users.service';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState(user?.languageId || 'fr');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, languagesData] = await Promise.all([
          apiService.getCategories(),
          usersService.getLanguages()
        ]);
        
        setCategories(categoriesData);
        setLanguages(languagesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        notifications.show({
          title: 'Erreur',
          message: 'Erreur lors du chargement des données',
          color: 'red'
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      try {
        const base64 = await convertToBase64(file);
        setAvatarBase64(base64);
        setPreviewUrl(base64);
      } catch (error) {
        console.error("Erreur lors de la conversion en base64:", error);
        toast.error("Erreur lors du traitement de l'image");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await updateUser({
        username,
        languageId: selectedLanguage,
        avatar: avatarBase64
      });
      setPreviewUrl(updatedUser.avatar || null);
      setAvatarFile(null);
      setAvatarBase64(undefined);
      notifications.show({
        title: 'Succès',
        message: 'Profil mis à jour avec succès',
        color: 'green'
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      notifications.show({
        title: 'Erreur',
        message: "Erreur lors de la mise à jour du profil",
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Navbar 
        categories={categories}
        loading={loadingCategories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6">
          <h1 className="text-2xl font-bold mb-6 text-white">Mon Profil</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Avatar</label>
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                      <i className="fas fa-user text-4xl text-gray-300"></i>
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <i className="fas fa-cloud-upload-alt text-2xl text-white mb-1"></i>
                    <span className="text-xs text-white">Changer</span>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div className="text-sm text-gray-400">
                  <p className="flex items-center">
                    <i className="fas fa-info-circle mr-2"></i>
                    Survolez l'avatar pour le modifier
                  </p>
                  <p className="flex items-center mt-1">
                    <i className="fas fa-check-circle mr-2"></i>
                    Format accepté : JPG, PNG (max 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2 text-white">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                required
              />
            </div>

            {/* Language selector */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium mb-2 text-white">
                Langue préférée
              </label>
              <select
                id="language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-400">
                <i className="fas fa-info-circle mr-2"></i>
                Cette langue sera utilisée pour l'interface du site
              </p>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Mise à jour...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 