import api from './api';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const categoryService = {
  async getAllCategories() {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  async getCategoryById(categoryId: string) {
    const response = await api.get<Category>(`/categories/${categoryId}`);
    return response.data;
  },

  async getCategoriesByParent(parentId: string) {
    const response = await api.get<Category[]>(`/categories/parent/${parentId}`);
    return response.data;
  },

  async createCategory(data: Partial<Category>) {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  async updateCategory(categoryId: string, data: Partial<Category>) {
    const response = await api.put<Category>(`/categories/${categoryId}`, data);
    return response.data;
  },

  async deleteCategory(categoryId: string) {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },

  async toggleCategoryStatus(categoryId: string) {
    const response = await api.put(`/categories/${categoryId}/toggle-status`);
    return response.data;
  },
};