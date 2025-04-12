import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingOverlay } from '@mantine/core';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, checkAdminRights } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAdmin = async () => {
      const hasAdminRights = await checkAdminRights();
      setIsAdmin(hasAdminRights);
    };

    verifyAdmin();
  }, [checkAdminRights]);

  if (isAdmin === null) {
    return <LoadingOverlay visible={true} />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
} 