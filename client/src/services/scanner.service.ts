import { api } from './api';
import { VerificationResult } from '../types';

export const scannerService = {
  async verifyQr(token: string, gateName = 'Gate 01 (Main Gate)'): Promise<VerificationResult> {
    const res = await api.post('/checkin/verify', { token, gateName });
    return res.data;
  },

  async manualCheckIn(registrationId: string, gateName = 'Gate 01 (Main Gate)'): Promise<VerificationResult> {
    const res = await api.post('/checkin/manual', { registrationId, gateName });
    return res.data;
  },
};
