import { api } from './api';
import { DashboardData, RegistrationListResponse } from '../types';

export interface RegistrationFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  graduationYear?: number;
  branch?: string;
  company?: string;
  status?: 'ALL' | 'CHECKED_IN' | 'PENDING';
}

export const adminService = {
  async getDashboard(): Promise<DashboardData> {
    const res = await api.get('/admin/dashboard');
    return res.data.data;
  },

  async getRegistrations(params: RegistrationFilterParams): Promise<RegistrationListResponse> {
    const res = await api.get('/admin/registrations', { params });
    return res.data;
  },

  async getRegistrationDetails(id: string) {
    const res = await api.get(`/admin/registrations/${id}`);
    return res.data.data;
  },

  async updateRegistration(id: string, data: any) {
    const res = await api.put(`/admin/registrations/${id}`, data);
    return res.data.data;
  },

  async downloadExportCsv(): Promise<void> {
    const response = await api.get('/admin/export', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `jecrc_alumni_diwali_2026_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
