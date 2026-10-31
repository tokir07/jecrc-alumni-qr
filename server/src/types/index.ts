import { Request } from 'express';

export type UserRole = 'ADMIN' | 'VOLUNTEER';

export interface AuthUserPayload {
  userId: string;
  username: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export type CheckInStatus = 'SUCCESS' | 'ALREADY_CHECKED_IN' | 'INVALID';

export interface VerificationResponse {
  status: CheckInStatus;
  message: string;
  alumni?: {
    fullName: string;
    registrationId: string;
    graduationYear: number;
    course?: string;
    branch: string;
    companyName: string;
    designation: string;
    currentCity?: string | null;
  };
  checkedInAt?: string;
  checkedInBy?: string;
  gateName?: string;
}
