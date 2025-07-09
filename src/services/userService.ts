import api from './api';

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  operator: boolean;
  admin: boolean;
  videosCount: number;
  created_at?: string;
  updated_at?: string;
}

export interface ApiUsersResponse {
  data: ApiUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  roles?: string[];
}

export interface UpdateUserRolesRequest {
  roles: string[];
}

/**
 * User Management Service - Admin only functionality
 */
class UserService {
  /**
   * Get all users (Admin only)
   */
  async getAllUsers(): Promise<ApiUser[]> {
    try {
      const response = await api.get<ApiUsersResponse>('/api/admin/users');
      
      // The API returns { data: ApiUser[], pagination: {...} }
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Fallback: if direct array response (for backward compatibility)
      if (Array.isArray(response.data)) {
        return response.data as ApiUser[];
      }
      
      console.warn('⚠️ API returned unexpected format, returning empty array');
      return [];
    } catch (error: unknown) {
      console.error('❌ Failed to fetch users:', error);
      throw error;
    }
  }

  /**
   * Get a specific user by ID (Admin only)
   */
  async getUserById(userId: number): Promise<ApiUser> {
    try {
      const response = await api.get<ApiUser>(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error: unknown) {
      console.error(`❌ Failed to fetch user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new user (Admin only)
   */
  async createUser(userData: CreateUserRequest): Promise<ApiUser> {
    try {
      const response = await api.post<ApiUser>('/api/admin/users', userData);
      return response.data;
    } catch (error: unknown) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Update an existing user (Admin only)
   */
  async updateUser(userId: number, userData: UpdateUserRequest): Promise<ApiUser> {
    try {
      const response = await api.put<ApiUser>(`/api/admin/users/${userId}`, userData);
      return response.data;
    } catch (error: unknown) {
      console.error(`❌ Failed to update user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a user (Admin only)
   */
  async deleteUser(userId: number): Promise<void> {
    try {
      await api.delete(`/api/admin/users/${userId}`);
    } catch (error: unknown) {
      console.error(`❌ Failed to delete user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user roles (Admin only)
   */
  async updateUserRoles(userId: number, roles: string[]): Promise<ApiUser> {
    try {
      const response = await api.patch<ApiUser>(`/api/admin/users/${userId}/roles`, { roles });
      return response.data;
    } catch (error: unknown) {
      console.error(`❌ Failed to update user roles ${userId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
const userService = new UserService();
export default userService; 