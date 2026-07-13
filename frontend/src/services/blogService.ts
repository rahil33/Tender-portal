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