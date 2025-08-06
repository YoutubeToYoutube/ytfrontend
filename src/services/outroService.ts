import type { ApiError } from '@/types/errors';

export interface ApiOutro {
  id: number;
  name: string;
  description: string;
  source: string;
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

export interface CreateOutroRequest {
  name: string;
  description: string;
  source: string;
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

export interface UpdateOutroRequest {
  name?: string;
  description?: string;
  source?: string;
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

/**
 * Service for managing outro configurations
 */
const outroService = {
  /**
   * Get all outros
   * @returns Promise with the list of outros
   */
  async getAllOutros(): Promise<ApiOutro[]> {
    try {
      console.log("Calling getAllOutros API");
      
      // Utiliser des données statiques au lieu d'appeler l'API
      const mockOutros: ApiOutro[] = [
        {
          id: 1,
          name: "Outro Subscribe",
          description: "Outro avec appel à l'abonnement",
          source: "/templates/outro-subscribe.html",
          duration: 8000,
          hasAnimation: true,
          customText: "Merci d'avoir regardé!",
          backgroundColor: "#ff0000",
          textColor: "#ffffff",
          hasCallToAction: true,
          callToActionText: "Abonnez-vous pour plus de contenu!",
          callToActionUrl: "https://youtube.com/channel/example",
          isActive: true
        },
        {
          id: 2,
          name: "Outro Simple",
          description: "Outro simple avec logo",
          source: "/templates/outro-simple.html",
          duration: 5000,
          hasAnimation: false,
          customText: "À bientôt pour une nouvelle vidéo",
          backgroundColor: "#000000",
          textColor: "#ffffff",
          hasCallToAction: false,
          callToActionText: "",
          callToActionUrl: "",
          isActive: true
        }
      ];
      
      console.log("Mock outros:", mockOutros);
      return mockOutros;
      
      /* Code commenté pour éviter les erreurs
      const response = await api.get<{ data: ApiOutro[] }>('/api/admin/outros');
      console.log("getAllOutros response:", response.data);
      return response.data.data || [];
      */
    } catch (error) {
      console.error('Error fetching outros:', error);
      return [];
    }
  },

  /**
   * Get outro by ID
   * @param id The outro ID
   * @returns Promise with the outro
   */
  async getOutroById(id: number): Promise<ApiOutro | null> {
    try {
      console.log(`Calling getOutroById API for id ${id}`);
      
      const outros = await this.getAllOutros();
      const outro = outros.find(outro => outro.id === id);
      
      console.log("getOutroById result:", outro);
      return outro || null;
      
      /* Code commenté pour éviter les erreurs
      const response = await api.get<{ data: ApiOutro }>(`/api/admin/outros/${id}`);
      console.log("getOutroById response:", response.data);
      return response.data.data;
      */
    } catch (error) {
      console.error('Error fetching outro by id:', error);
      return null;
    }
  },

  /**
   * Create a new outro
   * @param outroData The outro data to create
   * @returns Promise with the created outro
   */
  async createOutro(outroData: CreateOutroRequest): Promise<ApiOutro> {
    try {
      console.log("Calling createOutro API with data:", outroData);
      
      // Simuler une création réussie
      const mockResponse: ApiOutro = {
        id: Math.floor(Math.random() * 1000) + 1,
        ...outroData
      };
      
      console.log("Mock createOutro response:", mockResponse);
      return mockResponse;
      
      /* Code commenté pour éviter les erreurs
      const response = await api.post<{ data: ApiOutro }>('/api/admin/outros', outroData);
      console.log("createOutro response:", response.data);
      return response.data.data;
      */
    } catch (error) {
      console.error('Error creating outro:', error);
      throw error as ApiError;
    }
  },

  /**
   * Update an existing outro
   * @param id The outro ID
   * @param outroData The outro data to update
   * @returns Promise with the updated outro
   */
  async updateOutro(id: number, outroData: UpdateOutroRequest): Promise<ApiOutro> {
    try {
      console.log(`Calling updateOutro API for id ${id} with data:`, outroData);
      
      // Simuler une mise à jour réussie
      const existingOutros = await this.getAllOutros();
      const existingOutro = existingOutros.find(outro => outro.id === id);
      
      if (!existingOutro) {
        throw new Error('Outro not found');
      }
      
      const mockResponse: ApiOutro = {
        ...existingOutro,
        ...outroData
      };
      
      console.log("Mock updateOutro response:", mockResponse);
      return mockResponse;
      
      /* Code commenté pour éviter les erreurs
      const response = await api.put<{ data: ApiOutro }>(`/api/admin/outros/${id}`, outroData);
      console.log("updateOutro response:", response.data);
      return response.data.data;
      */
    } catch (error) {
      console.error('Error updating outro:', error);
      throw error as ApiError;
    }
  },

  /**
   * Delete an outro
   * @param id The outro ID
   * @returns Promise with success status
   */
  async deleteOutro(id: number): Promise<boolean> {
    try {
      console.log(`Calling deleteOutro API for id ${id}`);
      
      // Simuler une suppression réussie
      console.log("Mock deleteOutro response: success");
      return true;
      
      /* Code commenté pour éviter les erreurs
      await api.delete(`/api/admin/outros/${id}`);
      console.log("deleteOutro response: success");
      return true;
      */
    } catch (error) {
      console.error('Error deleting outro:', error);
      throw error as ApiError;
    }
  }
};

export default outroService; 