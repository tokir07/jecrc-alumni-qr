import { api } from './api';
import { AlumniRegistrationData } from '../types';

export interface RegisterPayload {
  fullName: string;
  email: string;
  mobile: string;
  currentCity?: string;
  graduationYear: number;
  course: string;
  branch: string;
  companyName: string;
  designation: string;
}

export const registrationService = {
  async register(data: RegisterPayload): Promise<AlumniRegistrationData> {
    const res = await api.post('/registrations', data);
    return res.data.data;
  },

  async getById(registrationId: string): Promise<AlumniRegistrationData> {
    const res = await api.get(`/registrations/${registrationId}`);
    return res.data.data;
  },
};
