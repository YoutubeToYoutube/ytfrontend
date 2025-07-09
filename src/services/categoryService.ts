import api from "./api";

export interface ApiCategory {
  id: number;
  name: string;
  description: string;
  datetime?: string;
  mediasCount?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryResponse {
  data: ApiCategory[];
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

const categoryService = {
  getAllCategories: async (): Promise<ApiCategory[]> => {
    const response = await api.get<CategoryResponse>(`/api/operator/categories`);
    // Extract the categories array from the nested data structure
    return response.data.data || [];
  },

  getCategory: async (id: number): Promise<ApiCategory> => {
    const response = await api.get(`/api/operator/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData: CreateCategoryRequest): Promise<ApiCategory> => {
    const response = await api.post(`/api/operator/categories`, categoryData);
    return response.data;
  },

  updateCategory: async (id: number, categoryData: UpdateCategoryRequest): Promise<ApiCategory> => {
    const response = await api.put(`/api/operator/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/api/operator/categories/${id}`);
  }
};

export default categoryService; 