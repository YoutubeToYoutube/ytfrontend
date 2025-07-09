import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { type UserRole } from '@/services/authService';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRoles?: UserRole | UserRole[];
}

/**
 * Protected Route Component
 * 
 * Protects routes based on authentication and optional role requirements
 * 
 * @param children - React children to render if authenticated
 * @param requiredRoles - Optional role(s) required to access the route
 */
export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();
  
  
  // Show loading state if authentication status is being determined
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check role requirements if specified
  if (requiredRoles && !hasRole(requiredRoles)) {
    // Redirect to unauthorized page or dashboard
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
} 