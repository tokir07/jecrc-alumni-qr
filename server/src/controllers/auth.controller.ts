import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { loginSchema, createVolunteerSchema } from '../validators/auth.validator.js';
import { authService } from '../services/auth.service.js';
import { env } from '../config/env.js';

export async function login(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const { token, user } = await authService.login(username, password);

    // Set secure HttpOnly cookie (cross-site None for Vercel <-> Render HTTPS production)
    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Authentication failed',
    });
  }
}

export function logout(req: AuthenticatedRequest, res: Response): void {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

export function getCurrentUser(req: AuthenticatedRequest, res: Response): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Not authenticated',
    });
    return;
  }

  res.status(200).json({
    success: true,
    user: req.user,
  });
}

export async function getVolunteers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const volunteers = await authService.getVolunteers();
    res.status(200).json({
      success: true,
      data: volunteers,
    });
  } catch (error) {
    next(error);
  }
}

export async function createVolunteer(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, password } = createVolunteerSchema.parse(req.body);
    const volunteer = await authService.createVolunteer(username, password);

    res.status(201).json({
      success: true,
      message: 'Volunteer account created successfully',
      data: volunteer,
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
      });
      return;
    }
    next(error);
  }
}
