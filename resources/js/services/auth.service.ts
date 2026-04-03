import { apiClient } from './api';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth'; // We'll define these next

export const authService = {
  // CRITICAL: We must request CSRF cookie before the first login attempt
  async initializeCsrf(): Promise<void> {
    await apiClient.get('/sanctum/csrf-cookie');
  },

  async login(credentials: LoginCredentials): Promise<{ message: string; user: User; redirect_to: string }> {
    await this.initializeCsrf();
    const response = await apiClient.post('/api/login', credentials);
    return response.data;
  },

  async register(data: RegisterCredentials): Promise<{ message: string; user_id: number }> {
    await this.initializeCsrf();
    const response = await apiClient.post('/api/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/logout');
  },

  async getMe(): Promise<{ user: User }> {
    const response = await apiClient.get('/api/user');
    return response.data;
  }
};
