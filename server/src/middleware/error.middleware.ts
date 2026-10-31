import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error Middleware]:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      issues: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      if (target.includes('normalizedEmail')) {
        res.status(409).json({
          success: false,
          error: 'An alumnus with this email address has already registered for the event.',
        });
        return;
      }
      if (target.includes('normalizedMobile')) {
        res.status(409).json({
          success: false,
          error: 'An alumnus with this mobile number has already registered for the event.',
        });
        return;
      }
      res.status(409).json({
        success: false,
        error: 'A duplicate entry already exists with these details.',
      });
      return;
    }
  }

  res.status(500).json({
    success: false,
    error: 'An internal server error occurred. Please try again later.',
  });
}
