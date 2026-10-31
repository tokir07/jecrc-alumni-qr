import { api } from './api';
import { User } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.user;
  },

  async getVolunteers(): Promise<User[]> {
    const res = await api.get('/auth/volunteers');
    return res.data.data;
  },

  async createVolunteer(username: string, password: string): Promise<User> {
    const res = await api.post('/auth/volunteers', { username, password });
    return res.data.data;
  },
};
