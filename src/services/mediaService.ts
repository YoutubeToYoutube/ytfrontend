import api from "./api";

export interface ApiMedia {
  id: number;
  category: {
    id: number;
    name: string;
  };
  name: string;
  description?: string;
  youtubeId?: string;
  creationDate: string;
  isActive: boolean;
  videosCount: number;
  activeCredentialsCount: number;
  connectedPlatformsCount: number;
  coverImageUrl?: string;
  introId?: number;
  outroId?: number;
  languageId?: number;
}

export interface MediaResponse {
  data: ApiMedia[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateMediaRequest {
  name: string;
  description?: string;
  youtubeId?: string;
  category: number; // Changé de categoryId à category pour correspondre à l'API
  isActive?: boolean;
}

export interface UpdateMediaRequest {
  name?: string;
  description?: string;
  youtubeId?: string;
  category?: number; // Changé de categoryId à category pour correspondre à l'API
  isActive?: boolean;
  coverImageUrl?: string;
}

export interface UpdateMediaConfigRequest {
  introId?: number;
  outroId?: number;
  languageId?: number;
}

export interface MediaVideo {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  publishedAt: string;
  views: number;
  duration?: string;
  url?: string;
}

const mediaService = {
  getAllMedia: async (): Promise<ApiMedia[]> => {
    try {
      console.log("Calling getAllMedia API");
      const response = await api.get<MediaResponse>(`/api/operator/medias`);
      console.log("getAllMedia response:", response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("Error in getAllMedia:", error);
      throw error;
    }
  },

  getMediaByCategory: async (categoryId: number): Promise<ApiMedia[]> => {
    try {
      console.log(`Calling getMediaByCategory API for categoryId: ${categoryId}`);
      const response = await api.get<MediaResponse>(`/api/operator/categories/${categoryId}/medias`);
      console.log("getMediaByCategory response:", response.data);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error in getMediaByCategory for categoryId ${categoryId}:`, error);
      throw error;
    }
  },

  getMediaById: async (id: number): Promise<ApiMedia> => {
    try {
      console.log(`Calling getMediaById API for id: ${id}`);
      const response = await api.get(`/api/operator/medias/${id}`);
      console.log("getMediaById response:", response.data);
      
      // La réponse contient un champ 'data' qui contient les données du média
      // Exemple: { data: { id: 1, name: "...", ... } }
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error in getMediaById for id ${id}:`, error);
      throw error;
    }
  },

  createMedia: async (mediaData: CreateMediaRequest): Promise<ApiMedia> => {
    const response = await api.post(`/api/operator/medias`, mediaData);
    return response.data;
  },

  updateMedia: async (id: number, mediaData: UpdateMediaRequest): Promise<ApiMedia> => {
    const response = await api.put(`/api/operator/medias/${id}`, mediaData);
    return response.data;
  },

  updateMediaConfig: async (id: number, configData: UpdateMediaConfigRequest): Promise<ApiMedia> => {
    const response = await api.put(`/api/operator/medias/${id}/config`, configData);
    return response.data;
  },

  uploadCoverImage: async (id: number, file: File): Promise<{ coverImageUrl: string }> => {
    try {
      console.log(`Calling uploadCoverImage API for id: ${id}`);
      const formData = new FormData();
      formData.append('cover', file);
      
      const response = await api.post(`/api/operator/medias/${id}/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("uploadCoverImage response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error in uploadCoverImage for id ${id}:`, error);
      throw error;
    }
  },

  // Cette méthode a été supprimée car l'endpoint n'existe pas
  // getRecentVideos: async (id: number, limit: number = 3): Promise<MediaVideo[]> => {
  //   const response = await api.get<MediaVideo[]>(`/api/operator/medias/${id}/videos?limit=${limit}`);
  //   return response.data;
  // },

  // Utiliser cette méthode pour obtenir des données statiques au lieu d'appeler l'API
  getMockRecentVideos: (): MediaVideo[] => {
    return [
      {
        id: "video1",
        title: "Visite virtuelle complète de la propriété",
        thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        publishedAt: "2024-03-14",
        views: 1205,
        duration: "3:45",
        url: "https://youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "video2",
        title: "Découverte de l'intérieur de la maison",
        thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        publishedAt: "2024-03-10",
        views: 843,
        duration: "2:30",
        url: "https://youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        id: "video3",
        title: "Tour du jardin et extérieur",
        thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        publishedAt: "2024-03-05",
        views: 1567,
        duration: "4:15",
        url: "https://youtube.com/watch?v=dQw4w9WgXcQ"
      },
    ];
  },

  deleteMedia: async (id: number): Promise<void> => {
    try {
      console.log(`Calling deleteMedia API for id: ${id}`);
      await api.delete(`/api/operator/medias/${id}`);
      console.log(`Media ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error in deleteMedia for id ${id}:`, error);
      throw error;
    }
  }
};

export default mediaService; 