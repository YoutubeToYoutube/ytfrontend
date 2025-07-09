import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { type User, type UserRole } from '@/services/authService';
import { AuthContext } from './AuthContextValue';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated on initial load
    const checkAuthStatus = async () => {
      setIsLoading(true);
      
      try {
        const isAuth = authService.isAuthenticated();
        
        if (isAuth) {
          const userData = authService.getCurrentUser();
          
          if (userData) {
            setUser(userData);
            
            // Check the current path
            const currentPath = window.location.pathname;
            
            if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
              navigate('/dashboard');
            }
          } else {
            console.log('❌ User data is null despite being authenticated');
          }
        } else {
          console.log('🔒 User is not authenticated');
        }
      } catch (error: unknown) {
        console.error('❌ Failed to fetch user data:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      const userData = await authService.login(email, password);
      
      // Set user state BEFORE navigation
      setUser(userData);
      
      // Short timeout to ensure state is updated before navigation
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
        setIsLoading(false);
      }, 100);
    } catch (error: unknown) {
      console.error('❌ Login error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email: string, name: string, password: string, role: UserRole) => {
    setIsLoading(true);
    
    try {
      await authService.register(email, name, password, role);
      navigate('/login');
    } catch (error: unknown) {
      console.error('❌ Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    const result = authService.hasRole(role);
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 