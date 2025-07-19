import api from "./api";

export interface ApiVideo {
  title: string;
  description: string;
  type: string;
  videoSource: string;
  tags: string;
  hashtags: string;
  userId: number;
  mediaId: number;
  isPublished: boolean;
}

export interface VideoResponse {
  data: ApiVideo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}