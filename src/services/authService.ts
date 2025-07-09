import api from './api';
import { jwtDecode } from 'jwt-decode';

export type UserRole = string;

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole[];
}

export interface AuthTokenPayload {
  iat: number;
  exp: number;
  roles: UserRole[];
  username: string;
}

export interface LoginResponse {
  token: string;
  user_id: number;
  roles: UserRole[];
  email: string;
  token_type: string;
}

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Auth Service - Centralizes all authentication related functionality
 */
class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Initialize from localStorage
    this.token = localStorage.getItem(TOKEN_KEY);
    
    const userStr = localStorage.getItem(USER_KEY);
    
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (error: unknown) {
        console.error('❌ Failed to parse user from localStorage', error);
        this.clearSession();
      }
    }
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<User> {
    
    try {
      const response = await api.post<LoginResponse>('/login', { email, password });
      
      // Create user object from response
      const user: User = {
        id: response.data.user_id.toString(),
        email: response.data.email,
        role: response.data.roles
      };
      
      // Store token and user
      this.setSession(response.data.token, user);
      return user;
    } catch (error: unknown) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(email: string, name: string, password: string, role: UserRole): Promise<void> {
    try {
      await api.post('/api/register', { email, name, password, role });
    } catch (error: unknown) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  }

  /**
   * Get available roles for registration
   */
  async getRoles(): Promise<string[]> {
    // Return the available roles based on your API specification
    return ['admin', 'operator'];
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): User | null {
    return this.user;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    
    if (!this.token) return false;
    
    try {
      const decodedToken = this.decodeToken();
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      const isExpired = decodedToken.exp < currentTime;
      
      if (isExpired) {
        this.clearSession();
        return false;
      }
      
      return true;
    } catch (error: unknown) {
      console.error('❌ Token validation failed:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Get the authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: UserRole | UserRole[]): boolean {
    if (!this.user) {
      return false;
    }
    
    if (!Array.isArray(this.user.role)) {
      return false;
    }
    
    if (Array.isArray(role)) {
      // Check if user has any of the specified roles
      const hasAnyRole = role.some(r => this.user?.role.includes(r));
      return hasAnyRole;
    }
    
    // Check if user has the specified role
    const hasRole = this.user.role.includes(role);
    return hasRole;
  }



  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put<User>(`/users/${this.user?.id}`, userData);
      
      // Update stored user data
      if (this.user) {
        this.user = { ...this.user, ...response.data };
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));
      }
      
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put(`/users/${this.user?.id}/password`, {
        currentPassword,
        newPassword
      });
    } catch (error: unknown) {
      console.error('❌ Failed to change password:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post('/forgot-password', { email });
    } catch (error: unknown) {
      console.error('❌ Failed to request password reset:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post('/reset-password', { token, newPassword });
    } catch (error: unknown) {
      console.error('❌ Failed to reset password:', error);
      throw error;
    }
  }

  /**
   * Set session data after successful authentication
   */
  private setSession(token: string, user: User): void {
    this.token = token;
    this.user = user;
    
    // Store in localStorage for persistence
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // Set default Authorization header for all requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear session data on logout or token expiration
   */
  private clearSession(): void {
    this.token = null;
    this.user = null;
    
    // Remove from localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Remove Authorization header
    delete api.defaults.headers.common['Authorization'];
  }

  /**
   * Logout the current user
   */
  logout(): void {
    this.clearSession();
  }

  /**
   * Decode the JWT token
   */
  private decodeToken(): AuthTokenPayload {
    if (!this.token) {
      console.error('❌ Cannot decode token: No token available');
      throw new Error('No token available');
    }
    
    try {
      const decoded = jwtDecode<AuthTokenPayload>(this.token);
      return decoded;
    } catch (error) {
      console.error('❌ Failed to decode token:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const authService = new AuthService();
export default authService; 