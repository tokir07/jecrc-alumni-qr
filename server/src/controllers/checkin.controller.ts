import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { verifyQrSchema, manualCheckInSchema } from '../validators/checkin.validator.js';
import { checkInService } from '../services/checkin.service.js';

export async function verifyQrCheckIn(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token, gateName } = verifyQrSchema.parse(req.body);
    const checkedInBy = req.user?.username || 'Gate-Volunteer';

    const result = await checkInService.verifyAndCheckIn(token, checkedInBy, gateName);

    // HTTP status code handling
    if (result.status === 'SUCCESS') {
      res.status(200).json(result);
    } else if (result.status === 'ALREADY_CHECKED_IN') {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    next(error);
  }
}

export async function manualCheckIn(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { registrationId, gateName } = manualCheckInSchema.parse(req.body);
    const checkedInBy = req.user?.username || 'Gate-Volunteer';

    const result = await checkInService.manualCheckInByRegistrationId(
      registrationId,
      checkedInBy,
      gateName
    );

    if (result.status === 'SUCCESS') {
      res.status(200).json(result);
    } else if (result.status === 'ALREADY_CHECKED_IN') {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    next(error);
  }
}
