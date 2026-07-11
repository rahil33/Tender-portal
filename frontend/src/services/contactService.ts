import api from './api';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  serviceType?: string;
}

export const contactService = {
  async submitForm(data: ContactFormData) {
    const response = await api.post('/contact', data);
    return response.data;
  },
};