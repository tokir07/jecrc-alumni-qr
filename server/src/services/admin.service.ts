import { prisma } from '../config/db.js';
import { formatToIST } from '../utils/dateFormatter.js';
import { UpdateAlumniInput } from '../validators/registration.validator.js';
import { normalizeEmail, normalizeMobile } from '../utils/crypto.js';
import { Prisma } from '@prisma/client';

export interface RegistrationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  graduationYear?: number;
  degree?: string;
  course?: string;
  branch?: string;
  company?: string;
  status?: 'ALL' | 'CHECKED_IN' | 'PENDING';
}

export class AdminService {
  /**
   * Calculate live dashboard statistics directly from PostgreSQL.
   */
  async getDashboardMetrics() {
    const totalRegistered = await prisma.alumniRegistration.count();
    const totalCheckedIn = await prisma.checkIn.count();
    const pendingEntries = Math.max(0, totalRegistered - totalCheckedIn);

    // Start of current day in local/UTC
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalEntriesToday = await prisma.checkIn.count({
      where: {
        checkedInAt: {
          gte: startOfDay,
        },
      },
    });

    // Recent 10 Check-ins
    const recentCheckInsData = await prisma.checkIn.findMany({
      take: 10,
      orderBy: { checkedInAt: 'desc' },
      include: {
        alumniRegistration: {
          select: {
            fullName: true,
            registrationId: true,
            graduationYear: true,
            degree: true,
            course: true,
            otherDegree: true,
            otherCourse: true,
            branch: true,
            companyName: true,
            designation: true,
          },
        },
      },
    });

    const recentCheckIns = recentCheckInsData.map((c) => ({
      id: c.id,
      name: c.alumniRegistration.fullName,
      registrationId: c.alumniRegistration.registrationId,
      batch: c.alumniRegistration.graduationYear,
      degree: c.alumniRegistration.degree,
      course: c.alumniRegistration.course,
      otherDegree: c.alumniRegistration.otherDegree,
      otherCourse: c.alumniRegistration.otherCourse,
      branch: c.alumniRegistration.branch,
      company: c.alumniRegistration.companyName,
      designation: c.alumniRegistration.designation,
      checkInTime: formatToIST(c.checkedInAt),
      gateName: c.gateName,
      checkedInBy: c.checkedInBy,
    }));

    // Hourly check-in activity for the attendance overview chart
    // Aggregate check-ins grouped into hour buckets
    const allCheckIns = await prisma.checkIn.findMany({
      select: { checkedInAt: true },
      orderBy: { checkedInAt: 'asc' },
    });

    const hourlyMap: Record<string, number> = {};
    for (const item of allCheckIns) {
      const date = new Date(item.checkedInAt);
      // Format hour in IST (e.g. "05:00 PM", "06:00 PM")
      const hourStr = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        hour12: true,
      }).format(date);

      hourlyMap[hourStr] = (hourlyMap[hourStr] || 0) + 1;
    }

    // Convert hourly map to array for Recharts
    const hourlyActivity = Object.entries(hourlyMap).map(([time, count]) => ({
      time,
      count,
    }));

    return {
      metrics: {
        totalRegistered,
        totalCheckedIn,
        pendingEntries,
        totalEntriesToday,
        checkInPercentage:
          totalRegistered > 0
            ? Math.round((totalCheckedIn / totalRegistered) * 100)
            : 0,
      },
      recentCheckIns,
      hourlyActivity,
    };
  }

  /**
   * Search and filter alumni registrations with server-side pagination.
   */
  async getRegistrations(params: RegistrationQueryParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 15));
    const skip = (page - 1) * limit;

    const where: Prisma.AlumniRegistrationWhereInput = {};

    // Search filter across name, email, mobile, registration ID, degree, course
    if (params.search && params.search.trim()) {
      const search = params.search.trim();
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { registrationId: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { degree: { contains: search, mode: 'insensitive' } },
        { course: { contains: search, mode: 'insensitive' } },
        { otherDegree: { contains: search, mode: 'insensitive' } },
        { otherCourse: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Specific filters
    if (params.graduationYear) {
      where.graduationYear = params.graduationYear;
    }

    if (params.degree && params.degree !== 'ALL') {
      where.degree = { equals: params.degree, mode: 'insensitive' };
    }

    if (params.course && params.course !== 'ALL') {
      where.course = { equals: params.course, mode: 'insensitive' };
    }

    if (params.branch && params.branch !== 'ALL') {
      where.branch = { equals: params.branch, mode: 'insensitive' };
    }

    if (params.company && params.company !== 'ALL') {
      where.companyName = { contains: params.company, mode: 'insensitive' };
    }

    if (params.status === 'CHECKED_IN') {
      where.checkIn = { isNot: null };
    } else if (params.status === 'PENDING') {
      where.checkIn = { is: null };
    }

    const [total, data] = await Promise.all([
      prisma.alumniRegistration.count({ where }),
      prisma.alumniRegistration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          checkIn: {
            select: {
              checkedInAt: true,
              checkedInBy: true,
              gateName: true,
            },
          },
        },
      }),
    ]);

    const formattedData = data.map((item) => ({
      id: item.id,
      registrationId: item.registrationId,
      fullName: item.fullName,
      email: item.email,
      mobile: item.mobile,
      currentCity: item.currentCity || '-',
      graduationYear: item.graduationYear,
      degree: item.degree,
      course: item.course,
      otherDegree: item.otherDegree,
      otherCourse: item.otherCourse,
      branch: item.branch,
      companyName: item.companyName,
      designation: item.designation,
      createdAt: formatToIST(item.createdAt),
      isCheckedIn: !!item.checkIn,
      checkedInAt: item.checkIn ? formatToIST(item.checkIn.checkedInAt) : null,
      checkedInBy: item.checkIn?.checkedInBy || null,
      gateName: item.checkIn?.gateName || null,
    }));

    return {
      data: formattedData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get complete details of a single registration for view modal.
   */
  async getRegistrationDetails(id: string) {
    const registration = await prisma.alumniRegistration.findUnique({
      where: { id },
      include: {
        event: true,
        checkIn: true,
      },
    });

    if (!registration) {
      return null;
    }

    return {
      ...registration,
      createdAtFormatted: formatToIST(registration.createdAt),
      updatedAtFormatted: formatToIST(registration.updatedAt),
      checkIn: registration.checkIn
        ? {
            ...registration.checkIn,
            checkedInAtFormatted: formatToIST(registration.checkIn.checkedInAt),
          }
        : null,
    };
  }

  /**
   * Update alumni registration details (Admin only).
   */
  async updateRegistration(id: string, input: UpdateAlumniInput) {
    const updateData: Prisma.AlumniRegistrationUpdateInput = {};

    if (input.fullName) updateData.fullName = input.fullName.trim();
    if (input.email) {
      updateData.email = input.email.trim();
      updateData.normalizedEmail = normalizeEmail(input.email);
    }
    if (input.mobile) {
      updateData.mobile = input.mobile.trim();
      updateData.normalizedMobile = normalizeMobile(input.mobile);
    }
    if (input.currentCity !== undefined) {
      updateData.currentCity = input.currentCity ? input.currentCity.trim() : null;
    }
    if (input.graduationYear) updateData.graduationYear = input.graduationYear;
    if (input.degree) updateData.degree = input.degree.trim();
    if (input.course) updateData.course = input.course.trim();
    if (input.otherDegree !== undefined) updateData.otherDegree = input.otherDegree ? input.otherDegree.trim() : null;
    if (input.otherCourse !== undefined) updateData.otherCourse = input.otherCourse ? input.otherCourse.trim() : null;
    if (input.branch) updateData.branch = input.branch.trim();
    if (input.companyName) updateData.companyName = input.companyName.trim();
    if (input.designation) updateData.designation = input.designation.trim();

    const updated = await prisma.alumniRegistration.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  /**
   * Export all registrations to CSV.
   */
  async exportRegistrationsCsv(): Promise<string> {
    const registrations = await prisma.alumniRegistration.findMany({
      orderBy: { registrationId: 'asc' },
      include: {
        checkIn: true,
      },
    });

    const headers = [
      'Registration ID',
      'Full Name',
      'Email',
      'Mobile',
      'Current City',
      'Graduation Year',
      'Degree',
      'Course',
      'Company',
      'Designation',
      'Registration Date (IST)',
      'Entry Status',
      'Check-in Time (IST)',
      'Gate Name',
      'Verified By',
    ];

    const escapeCsv = (str: string | number | null | undefined): string => {
      if (str === null || str === undefined) return '""';
      let val = String(str);
      // Guard against CSV / Spreadsheet formula injection (OWASP CSV Injection)
      if (/^[=\+\-@\t\r]/.test(val)) {
        val = `'${val}`;
      }
      return `"${val.replace(/"/g, '""')}"`;
    };

    const rows = registrations.map((r) => {
      const displayDegree =
        r.degree === 'Other / Not Listed' && r.otherDegree
          ? `${r.degree} (${r.otherDegree})`
          : r.degree;
      const displayCourse =
        r.course === 'Other / Not Listed' && r.otherCourse
          ? `${r.course} (${r.otherCourse})`
          : r.course;

      return [
        escapeCsv(r.registrationId),
        escapeCsv(r.fullName),
        escapeCsv(r.email),
        escapeCsv(r.mobile),
        escapeCsv(r.currentCity || ''),
        escapeCsv(r.graduationYear),
        escapeCsv(displayDegree),
        escapeCsv(displayCourse),
        escapeCsv(r.companyName),
        escapeCsv(r.designation),
        escapeCsv(formatToIST(r.createdAt)),
        escapeCsv(r.checkIn ? 'CHECKED IN' : 'PENDING'),
        escapeCsv(r.checkIn ? formatToIST(r.checkIn.checkedInAt) : ''),
        escapeCsv(r.checkIn?.gateName || ''),
        escapeCsv(r.checkIn?.checkedInBy || ''),
      ];
    });

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  }
}

export const adminService = new AdminService();
