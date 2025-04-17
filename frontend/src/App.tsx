import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import ChallengesPage from './pages/ChallengesPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfile from './pages/PublicProfile';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import CategoryChallengesPage from './pages/CategoryChallengesPage';
import ChallengePage from './pages/ChallengePage';
import ErrorPage from './pages/ErrorPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface AdminRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900 items-center justify-center">
        <div className="text-white">
          <i className="fas fa-spinner fa-spin text-4xl"></i>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900 items-center justify-center">
        <div className="text-white">
          <i className="fas fa-spinner fa-spin text-4xl"></i>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-900 items-center justify-center">
        <div className="text-white">
          <i className="fas fa-spinner fa-spin text-4xl"></i>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={user ? <Navigate to="/" /> : <LoginPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" /> : <RegisterPage />}
        errorElement={<ErrorPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChallengesPage />
          </ProtectedRoute>
        }
        errorElement={<ErrorPage />}
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
        errorElement={<ErrorPage />}
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
        errorElement={<ErrorPage />}
      />
      <Route
        path="/challenges"
        element={
          <ProtectedRoute>
            <ChallengesPage />
          </ProtectedRoute>
        }
        errorElement={<ErrorPage />}
      />
      <Route
        path="/categories/:categoryId"
        element={
          <ProtectedRoute>
            <CategoryChallengesPage />
          </ProtectedRoute>
        }
        errorElement={<ErrorPage />}
      />
      <Route
        path="/challenges/:id"
        element={
          <ProtectedRoute>
            <ChallengePage />
          </ProtectedRoute>
        }
        errorElement={<ErrorPage />}
      />
      <Route 
        path="/users/:userId" 
        element={<PublicProfile />}
        errorElement={<ErrorPage />}
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
        errorElement={<ErrorPage />}
      />
      
      {/* Route pour attraper les 404 */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export function App() {
  return (
    <MantineProvider>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <Notifications />
            <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </Router>
    </MantineProvider>
  );
}
