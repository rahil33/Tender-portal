import api from './api';

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    role: string;
    avatar?: string;
    email?: string;
  };
  publishedAt: string;
  isPublished: boolean;
  views: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetPostsResponse {
  success: boolean;
  message: string;
  data: {
    data: BlogPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface NewsletterSubscribeRequest {
  email: string;
  source?: 'website' | 'blog' | 'landing-page' | 'other';
}

export interface NewsletterSubscribeResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    subscribedAt: string;
    isActive: boolean;
  };
}

export const getAllPosts = async (
  page = 1,
  limit = 10,
  filters?: { category?: string; tag?: string; sortBy?: string; sortOrder?: string }
): Promise<GetPostsResponse> => {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (filters?.category) params.append('category', filters.category);
  if (filters?.tag) params.append('tag', filters.tag);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
  
  const response = await api.get<GetPostsResponse>(`/blog/posts?${params.toString()}`);
  return response.data;
};

export const getPostBySlug = async (slug: string): Promise<{ success: boolean; message: string; data: BlogPost }> => {
  const response = await api.get<{ success: boolean; message: string; data: BlogPost }>(`/blog/posts/${slug}`);
  return response.data;
};

export const subscribeToNewsletter = async (
  email: string,
  source: 'website' | 'blog' | 'landing-page' | 'other' = 'website'
): Promise<NewsletterSubscribeResponse> => {
  const response = await api.post<NewsletterSubscribeResponse>('/blog/newsletter/subscribe', {
    email,
    source,
  });
  return response.data;
};

export const unsubscribeFromNewsletter = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/blog/newsletter/unsubscribe', { email });
  return response.data;
};