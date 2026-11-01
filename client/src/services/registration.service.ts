import { api } from './api';
import { AlumniRegistrationData, RegisterPayload } from '../types';

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
export type { RegisterPayload };
