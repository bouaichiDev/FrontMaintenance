import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

interface GuardProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: GuardProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect SUPER_ADMIN to admin dashboard if they hit standard routes
  if (user.role === 'SUPER_ADMIN' && window.location.pathname === '/') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

export function AuthRoute({ children }: GuardProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    if (user.role === 'SUPER_ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

interface RoleGuardProps extends GuardProps {
  allowedRoles: UserRole[];
}

export function RoleRoute({ children, allowedRoles }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    // If not authorized, redirect to their home base
    if (user?.role === 'SUPER_ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
