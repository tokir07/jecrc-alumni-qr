import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { adminService } from '../services/admin.service.js';
import { updateAlumniSchema } from '../validators/registration.validator.js';

export async function getDashboard(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await adminService.getDashboardMetrics();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRegistrations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 15;
    const search = (req.query.search as string) || '';
    const graduationYear = req.query.graduationYear
      ? parseInt(req.query.graduationYear as string, 10)
      : undefined;
    const degree = (req.query.degree as string) || undefined;
    const course = (req.query.course as string) || undefined;
    const branch = (req.query.branch as string) || undefined;
    const company = (req.query.company as string) || undefined;
    const game = (req.query.game as string) || undefined;
    const status = (req.query.status as 'ALL' | 'CHECKED_IN' | 'PENDING') || 'ALL';

    const result = await adminService.getRegistrations({
      page,
      limit,
      search,
      graduationYear,
      degree,
      course,
      branch,
      company,
      game,
      status,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRegistrationById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const registration = await adminService.getRegistrationDetails(id);

    if (!registration) {
      res.status(404).json({
        success: false,
        error: 'Registration record not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRegistration(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = updateAlumniSchema.parse(req.body);

    const updated = await adminService.updateRegistration(id, updateData);

    res.status(200).json({
      success: true,
      message: 'Alumni registration updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function exportRegistrations(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const csvData = await adminService.exportRegistrationsCsv();
    const filename = `jecrc_alumni_diwali_2026_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
}
