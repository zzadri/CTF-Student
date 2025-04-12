import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!/^\S+@\S+$/.test(email)) {
      newErrors.email = "Email invalide";
    }

    if (isRegister && !username) {
      newErrors.username = "Le nom d'utilisateur est requis";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (isRegister) {
        await register(username, email, password);
      } else {
        await login(email, password);
      }
      navigate('/challenges');
    } catch (error) {
      alert(isRegister ? "Erreur lors de l'inscription" : "Identifiants invalides");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="text-center mb-12">
                  <h1 className="text-3xl font-bold text-blue-600 mb-2">
                    Apprendre la cybersécurité
                  </h1>
                  <p className="text-gray-600 text-sm">
                    {isRegister 
                      ? "Créez un compte pour commencer l'aventure"
                      : "Connectez-vous à votre compte pour commencer"
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="text-sm font-bold text-gray-600 block">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {isRegister && (
                    <div>
                      <label htmlFor="username" className="text-sm font-bold text-gray-600 block">
                        Nom d'utilisateur
                      </label>
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Votre nom d'utilisateur"
                      />
                      {errors.username && (
                        <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="password" className="text-sm font-bold text-gray-600 block">
                      Mot de passe
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Votre mot de passe"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-semibold transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                      {isRegister ? "S'inscrire" : "Se connecter"}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    {isRegister ? "Déjà inscrit ?" : "Pas encore de compte ?"}
                    {" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegister(!isRegister);
                        setEmail('');
                        setUsername('');
                        setPassword('');
                        setErrors({});
                      }}
                      className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                      {isRegister ? "Se connecter" : "Créer un compte"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 