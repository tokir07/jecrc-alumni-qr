import { Request, Response, NextFunction } from 'express';
import { alumniRegistrationSchema } from '../validators/registration.validator.js';
import { registrationService } from '../services/registration.service.js';

export async function createRegistration(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedData = alumniRegistrationSchema.parse(req.body);
    const result = await registrationService.registerAlumni(validatedData);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your pass has been generated.',
      data: result,
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

export async function getRegistration(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { registrationId } = req.params;
    if (!registrationId) {
      res.status(400).json({
        success: false,
        error: 'Registration ID is required',
      });
      return;
    }

    const data = await registrationService.getRegistrationById(registrationId);
    if (!data) {
      res.status(404).json({
        success: false,
        error: `No registration found for ID: ${registrationId}`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
