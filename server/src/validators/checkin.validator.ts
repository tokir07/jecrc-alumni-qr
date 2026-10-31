import { z } from 'zod';

export const verifyQrSchema = z.object({
  token: z.string().trim().min(1, 'Token is required'),
  gateName: z.string().trim().default('Main Gate'),
});

export const manualCheckInSchema = z.object({
  registrationId: z.string().trim().min(5, 'Valid Registration ID is required'),
  gateName: z.string().trim().default('Main Gate'),
});

export type VerifyQrInput = z.infer<typeof verifyQrSchema>;
export type ManualCheckInInput = z.infer<typeof manualCheckInSchema>;
