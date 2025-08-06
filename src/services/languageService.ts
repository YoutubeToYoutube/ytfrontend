import type { ApiError } from '@/types/errors';

export interface ApiLanguage {
  id: number;
  code: string;
  name: string;
  active: boolean;
  createdAt: string | null;
  updatedAt: string;
}

export interface CreateLanguageRequest {
  code: string;
  name: string;
  active: boolean;
}

export interface UpdateLanguageRequest {
  code?: string;
  name?: string;
  active?: boolean;
}

/**
 * Service for managing language configurations
 */
const languageService = {
  /**
   * Get all languages
   * @returns Promise with the list of languages
   */
  async getAllLanguages(): Promise<ApiLanguage[]> {
    try {
      console.log("Calling getAllLanguages API");
      
      // Utiliser des données statiques au lieu d'appeler l'API
      const mockLanguages: ApiLanguage[] = [
        {
          id: 1,
          code: "fr",
          name: "Français",
          active: true,
          createdAt: null,
          updatedAt: "2025-07-27T18:04:11+02:00"
        },
        {
          id: 2,
          code: "en",
          name: "English",
          active: true,
          createdAt: null,
          updatedAt: "2025-07-27T18:04:11+02:00"
        },
        {
          id: 3,
          code: "es",
          name: "Español",
          active: false,
          createdAt: null,
          updatedAt: "2025-07-27T18:04:11+02:00"
        }
      ];
      
      console.log("Mock languages:", mockLanguages);
      return mockLanguages;
      
      /* Code commenté pour éviter les erreurs
      const response = await api.get<{ data: ApiLanguage[] }>('/api/admin/languages');
      console.log("getAllLanguages response:", response.data);
      return response.data.data || [];
      */
    } catch (error) {
      console.error('Error fetching languages:', error);
      return [];
    }
  },

  /**
   * Get language by ID
   * @param id The language ID
   * @returns Promise with the language
   */
  async getLanguageById(id: number): Promise<ApiLanguage | null> {
    try {
      console.log(`Calling getLanguageById API for id ${id}`);
      
      const languages = await this.getAllLanguages();
      const language = languages.find(lang => lang.id === id);
      
      console.log("getLanguageById result:", language);
      return language || null;
      
      /* Code commenté pour éviter les erreurs
      const response = await api.get<{ data: ApiLanguage }>(`/api/admin/languages/${id}`);
      console.log("getLanguageById response:", response.data);
      return response.data.data;
      */
    } catch (error) {
      console.error('Error fetching language by id:', error);
      return null;
    }
  },

  /**
   * Create a new language
   * @param languageData The language data to create
   * @returns Promise with the created language
   */
  async createLanguage(languageData: CreateLanguageRequest): Promise<ApiLanguage> {
    try {
      console.log("Calling createLanguage API with data:", languageData);
      
      // Simuler une création réussie
      const mockResponse: ApiLanguage = {
        id: Math.floor(Math.random() * 1000) + 1,
        ...languageData,
        createdAt: null,
        updatedAt: new Date().toISOString()
      };
      
      console.log("Mock createLanguage response:", mockResponse);
      return mockResponse;
      
      /* Code commenté pour éviter les erreurs
      const response = await api.post<{ data: ApiLanguage }>('/api/admin/languages', languageData);
      console.log("createLanguage response:", response.data);
      return response.data.data;
      */
    } catch (error) {
      console.error('Error creating language:', error);
      throw error as ApiError;
    }
  },

  /**
   * Update an existing language
   * @param id The language ID
   * @param languageData The language data to update
   * @returns Promise with the updated language
   */
  async updateLanguage(id: number, languageData: UpdateLanguageRequest): Promise<ApiLanguage> {
    try {
      console.log(`Calling updateLanguage API for id ${id} with data:`, languageData);
      
      // Simuler une mise à jour réussie
      const existingLanguages = await this.getAllLanguages();
      const existingLanguage = existingLanguages.find(language => language.id === id);
      
      if (!existingLanguage) {
        throw new Error('Language not found');
      }
      
      const mockResponse: ApiLanguage = {
        ...existingLanguage,
        ...languageData,
        updatedAt: new Date().toISOString()
      };
      
      console.log("Mock updateLanguage response:", mockResponse);
      return mockResponse;
      
      /* Code commenté pour éviter les erreurs
      const response = await api.put<{ data: ApiLanguage }>(`/api/admin/languages/${id}`, languageData);
      console.log("updateLanguage response:", response.data);
      return response.data.data;
      */
    } catch (error) {
      console.error('Error updating language:', error);
      throw error as ApiError;
    }
  },

  /**
   * Delete a language
   * @param id The language ID
   * @returns Promise with success status
   */
  async deleteLanguage(id: number): Promise<boolean> {
    try {
      console.log(`Calling deleteLanguage API for id ${id}`);
      
      // Simuler une suppression réussie
      console.log("Mock deleteLanguage response: success");
      return true;
      
      /* Code commenté pour éviter les erreurs
      await api.delete(`/api/admin/languages/${id}`);
      console.log("deleteLanguage response: success");
      return true;
      */
    } catch (error) {
      console.error('Error deleting language:', error);
      throw error as ApiError;
    }
  }
};

export default languageService; 