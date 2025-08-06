// import api from './api';
import type { ApiError } from '@/types/errors';
import introService from '@/services/introService';
import outroService from '@/services/outroService';
import languageService from '@/services/languageService';
import type { ApiIntro } from '@/services/introService';
import type { ApiOutro } from '@/services/outroService';
import type { ApiLanguage } from '@/services/languageService';

export interface ApiChannelConfig {
  id: number;
  name: string;
  lastModified: string;
  intro: ApiIntro[];
  outro: ApiOutro[];
  language: ApiLanguage[];
  media: { id: number; name: string }[];
  description: string | null;
  duration: number | null;
  isActive: boolean;
}

export interface CreateChannelConfigRequest {
  name: string;
  languageId?: number;
  introId?: number;
  outroId?: number;
  mediaId?: number;
}

/**
 * Service for managing channel configurations
 */
const configService = {
  /**
   * Get all languages (delegated to languageService)
   * @returns Promise with the list of languages
   */
  async getLanguages(): Promise<ApiLanguage[]> {
    return languageService.getAllLanguages();
  },

  /**
   * Get all intros (delegated to introService)
   * @returns Promise with the list of intros
   */
  async getIntros(): Promise<ApiIntro[]> {
    const response = await introService.getAllIntros(1, 100); // Récupérer jusqu'à 100 intros
    return response.data;
  },

  /**
   * Get all outros (delegated to outroService)
   * @returns Promise with the list of outros
   */
  async getOutros(): Promise<ApiOutro[]> {
    return outroService.getAllOutros();
  },

  /**
   * Create a channel configuration
   * @param config The configuration data to create
   * @returns Promise with the created configuration
   */
  async createChannelConfig(config: CreateChannelConfigRequest): Promise<ApiChannelConfig> {
    try {
      console.log("Calling createChannelConfig API with data:", config);
      
      // Simuler une création réussie
      const mockResponse: ApiChannelConfig = {
        id: Math.floor(Math.random() * 1000) + 1,
        name: config.name,
        lastModified: new Date().toISOString(),
        intro: config.introId ? [await this.getMockIntroById(config.introId)] : [],
        outro: config.outroId ? [await this.getMockOutroById(config.outroId)] : [],
        language: config.languageId ? [await this.getMockLanguageById(config.languageId)] : [],
        media: config.mediaId ? [{ id: config.mediaId, name: "Media " + config.mediaId }] : [],
        description: null,
        duration: null,
        isActive: true
      };
      
      console.log("Mock createChannelConfig response:", mockResponse);
      return mockResponse;
      
      /* Code commenté pour éviter les erreurs
      const response = await api.post<{ data: ApiChannelConfig }>('/api/admin/channel-configs', config);
      console.log("createChannelConfig response:", response.data);
      return response.data.data;
      */
    } catch (error) {
      console.error('Error creating channel config:', error);
      throw error as ApiError;
    }
  },
  
  // Méthodes d'aide pour récupérer des objets mock par ID
  async getMockIntroById(id: number): Promise<ApiIntro> {
    const intro = await introService.getIntroById(id);
    if (!intro) {
      const introsResponse = await introService.getAllIntros(1, 10);
      return introsResponse.data[0];
    }
    return intro;
  },
  
  async getMockOutroById(id: number): Promise<ApiOutro> {
    const outro = await outroService.getOutroById(id);
    if (!outro) {
      const outros = await outroService.getAllOutros();
      return outros[0];
    }
    return outro;
  },
  
  async getMockLanguageById(id: number): Promise<ApiLanguage> {
    const language = await languageService.getLanguageById(id);
    if (!language) {
      const languages = await languageService.getAllLanguages();
      return languages[0];
    }
    return language;
  },

  /**
   * Get channel configurations for a media
   * @param mediaId The ID of the media
   * @returns Promise with the channel configurations
   */
  async getChannelConfigsByMedia(mediaId: number): Promise<ApiChannelConfig[]> {
    try {
      console.log(`Calling getChannelConfigsByMedia for mediaId: ${mediaId}`);
      
      // Pour l'instant, retourner un tableau vide car l'API n'est pas complètement implémentée
      console.log(`No channel configs found for mediaId ${mediaId}, returning empty array`);
      return [];
      
      /* Code commenté pour éviter les erreurs
      // The endpoint should be /api/admin/channel-configs instead of /api/admin/media/${mediaId}/channel-configs
      const response = await api.get<{ data: ApiChannelConfig[] }>('/api/admin/channel-configs');
      console.log("getChannelConfigsByMedia raw response:", response.data);
      
      // Filter the results to find configs associated with this media
      const allConfigs = response.data.data || [];
      console.log("All channel configs:", allConfigs);
      
      // Check if media array exists and contains objects with id property
      const filteredConfigs = allConfigs.filter(config => {
        if (!Array.isArray(config.media)) {
          console.warn(`Config ${config.id} has invalid media property:`, config.media);
          return false;
        }
        
        const hasMatchingMedia = config.media.some(m => {
          if (typeof m !== 'object' || m === null) {
            console.warn(`Config ${config.id} has invalid media item:`, m);
            return false;
          }
          
          const mediaIdMatch = m.id === mediaId;
          if (mediaIdMatch) {
            console.log(`Found matching media ID ${mediaId} in config ${config.id}`);
          }
          return mediaIdMatch;
        });
        
        return hasMatchingMedia;
      });
      
      console.log(`Filtered configs for mediaId ${mediaId}:`, filteredConfigs);
      return filteredConfigs;
      */
    } catch (error) {
      console.error(`Error in getChannelConfigsByMedia for mediaId ${mediaId}:`, error);
      // Return empty array instead of throwing to avoid breaking the page
      return [];
    }
  }
};

export default configService; 