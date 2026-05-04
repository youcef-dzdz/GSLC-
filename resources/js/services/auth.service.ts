import { apiClient, setToken, clearToken, getToken } from './api';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth';

export const authService = {

  async login(credentials: LoginCredentials): Promise<{ message: string; user: User; redirect_to: string }> {
    const response = await apiClient.post('/api/login', credentials);
    const { token, ...rest } = response.data;

    // Save token so every subsequent request includes it
    if (token) {
      setToken(token);
    }

    return rest;
  },

  async register(data: RegisterCredentials): Promise<{ message: string; user_id: number }> {
    const response = await apiClient.post('/api/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/logout');
    clearToken();
  },

  async getMe(): Promise<{ user: User }> {
    const response = await apiClient.get('/api/user');
    return response.data;
  },

  isTokenPresent(): boolean {
    return !!getToken();
  },
};
