import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return <NotificationBell />;
}; 