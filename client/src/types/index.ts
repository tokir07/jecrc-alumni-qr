export type UserRole = 'ADMIN' | 'VOLUNTEER';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface AlumniRegistrationData {
  registrationId: string;
  fullName: string;
  email: string;
  mobile: string;
  currentCity?: string | null;
  graduationYear: number;
  course: string;
  branch: string;
  companyName: string;
  designation: string;
  createdAt: string;
  eventName: string;
  eventYear: number;
  venue: string;
  eventDate: string;
  qrCodeDataUrl?: string;
  isCheckedIn?: boolean;
  checkedInAt?: string | null;
}

export interface VerificationResult {
  status: 'SUCCESS' | 'ALREADY_CHECKED_IN' | 'INVALID';
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

export interface DashboardMetrics {
  totalRegistered: number;
  totalCheckedIn: number;
  pendingEntries: number;
  totalEntriesToday: number;
  checkInPercentage: number;
}

export interface RecentCheckIn {
  id: string;
  name: string;
  registrationId: string;
  batch: number;
  branch: string;
  company: string;
  designation: string;
  checkInTime: string;
  gateName: string;
  checkedInBy: string;
}

export interface HourlyActivity {
  time: string;
  count: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentCheckIns: RecentCheckIn[];
  hourlyActivity: HourlyActivity[];
}

export interface RegistrationListItem {
  id: string;
  registrationId: string;
  fullName: string;
  email: string;
  mobile: string;
  currentCity: string;
  graduationYear: number;
  course: string;
  branch: string;
  companyName: string;
  designation: string;
  createdAt: string;
  isCheckedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
  gateName: string | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RegistrationListResponse {
  success: boolean;
  data: RegistrationListItem[];
  pagination: Pagination;
}
