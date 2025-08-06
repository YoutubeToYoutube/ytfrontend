import api from './api';
import type { ApiError } from '@/types/errors';

export interface ApiIntro {
  id: number;
  name: string;
  description: string;
  source: string;
  type: string;
  duration: number;
  hasAnimation: boolean;
  customText: string;
  backgroundColor: string;
  textColor: string;
  hasCallToAction: boolean;
  callToActionText: string;
  callToActionUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIntroRequest {
  name: string;
  source: string;
  description: string;
  type: string;
  duration: number;
  hasAnimation: boolean;
  customText: string;
  backgroundColor: string;
  textColor: string;
  hasCallToAction: boolean;
  callToActionText: string;
  callToActionUrl: string;
  isActive: boolean;
}

export interface UpdateIntroRequest {
  name?: string;
  source?: string;
  description?: string;
  type?: string;
  duration?: number;
  hasAnimation?: boolean;
  customText?: string;
  backgroundColor?: string;
  textColor?: string;
  hasCallToAction?: boolean;
  callToActionText?: string;
  callToActionUrl?: string;
  isActive?: boolean;
}

export interface IntroListResponse {
  data: ApiIntro[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Service for managing intro configurations
 */
const introService = {
  /**
   * Get all intros with pagination and filters
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   * @param type Filter by type (optional)
   * @param activeOnly Filter by active status (optional)
   * @returns Promise with the list of intros and pagination info
   */
  async getAllIntros(page: number = 1, limit: number = 10, type?: string, activeOnly?: boolean): Promise<IntroListResponse> {
    try {
      console.log("Calling getAllIntros API");
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (type) {
        params.append('type', type);
      }
      
      if (activeOnly !== undefined) {
        params.append('active_only', activeOnly.toString());
      }
      
      const response = await api.get<IntroListResponse>(`/api/admin/intros?${params.toString()}`);
      console.log("getAllIntros response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching intros:', error);
      throw error as ApiError;
    }
  },

  /**
   * Get intro by ID
   * @param id The intro ID
   * @returns Promise with the intro
   */
  async getIntroById(id: number): Promise<ApiIntro | null> {
    try {
      console.log(`Calling getIntroById API for id ${id}`);
      
      const response = await api.get<{ data: ApiIntro }>(`/api/admin/intros/${id}`);
      console.log("getIntroById response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching intro by id:', error);
      return null;
    }
  },

  /**
   * Create a new intro
   * @param introData The intro data to create
   * @returns Promise with the created intro
   */
  async createIntro(introData: CreateIntroRequest): Promise<ApiIntro> {
    try {
      console.log("Calling createIntro API with data:", introData);
      
      const response = await api.post<{ data: ApiIntro }>('/api/admin/intros', introData);
      console.log("createIntro response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating intro:', error);
      throw error as ApiError;
    }
  },

  /**
   * Update an existing intro
   * @param id The intro ID
   * @param introData The intro data to update
   * @returns Promise with the updated intro
   */
  async updateIntro(id: number, introData: UpdateIntroRequest): Promise<ApiIntro> {
    try {
      console.log(`Calling updateIntro API for id ${id} with data:`, introData);
      
      const response = await api.put<{ data: ApiIntro }>(`/api/admin/intros/${id}`, introData);
      console.log("updateIntro response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating intro:', error);
      throw error as ApiError;
    }
  },

  /**
   * Delete an intro
   * @param id The intro ID
   * @returns Promise with success status
   */
  async deleteIntro(id: number): Promise<boolean> {
    try {
      console.log(`Calling deleteIntro API for id ${id}`);
      
      await api.delete(`/api/admin/intros/${id}`);
      console.log("deleteIntro response: success");
      return true;
    } catch (error) {
      console.error('Error deleting intro:', error);
      throw error as ApiError;
    }
  },

  /**
   * Toggle intro status (active/inactive)
   * @param id The intro ID
   * @returns Promise with the updated intro
   */
  async toggleIntroStatus(id: number): Promise<ApiIntro> {
    try {
      console.log(`Calling toggleIntroStatus API for id ${id}`);
      
      const response = await api.patch<{ data: ApiIntro }>(`/api/admin/intros/${id}/toggle-status`);
      console.log("toggleIntroStatus response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error toggling intro status:', error);
      throw error as ApiError;
    }
  }
};

export default introService; 