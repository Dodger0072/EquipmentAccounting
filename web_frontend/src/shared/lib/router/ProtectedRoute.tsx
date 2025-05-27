// src/shared/lib/router/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useStore } from 'effector-react';
import { $isAuthenticated } from '@/entities/equipment/session';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useStore($isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};