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
}

const mediaService = {
  getAllMedia: async (): Promise<ApiMedia[]> => {
    const response = await api.get<MediaResponse>(`/api/operator/medias`);
    return response.data.data || [];
  },

  getMediaByCategory: async (categoryId: number): Promise<ApiMedia[]> => {
    const response = await api.get<MediaResponse>(`/api/operator/categories/${categoryId}/medias`);
    return response.data.data || [];
  },

  getMedia: async (id: number): Promise<ApiMedia> => {
    const response = await api.get(`/api/operator/medias/${id}`);
    return response.data;
  },

  createMedia: async (mediaData: CreateMediaRequest): Promise<ApiMedia> => {
    const response = await api.post(`/api/operator/medias`, mediaData);
    return response.data;
  },

  updateMedia: async (id: number, mediaData: UpdateMediaRequest): Promise<ApiMedia> => {
    const response = await api.put(`/api/operator/medias/${id}`, mediaData);
    return response.data;
  },

  deleteMedia: async (id: number): Promise<void> => {
    await api.delete(`/api/operator/medias/${id}`);
  }
};

export default mediaService; 