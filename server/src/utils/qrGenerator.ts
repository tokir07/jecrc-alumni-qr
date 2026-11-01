import QRCode from 'qrcode';
import { env } from '../config/env.js';

export interface QrOptions {
  width?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
}

/**
 * Generate a verification URL payload for the QR code.
 * Crucially, personal details are NEVER placed inside the QR payload.
 */
export function buildQrPayload(token: string): string {
  // Format: https://domain/checkin/verify?token=...
  const baseUrl = (env.PUBLIC_APP_URL || env.APP_BASE_URL).replace(/\/+$/, '');
  return `${baseUrl}/checkin/verify?token=${token}`;
}

/**
 * Generate high-resolution QR code data URL (image/png base64)
 */
export async function generateQrDataUrl(
  payload: string,
  options?: QrOptions
): Promise<string> {
  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    errorCorrectionLevel: 'H', // High error correction level for reliable printing
    type: 'image/png',
    margin: options?.margin ?? 2,
    width: options?.width ?? 400,
    color: {
      dark: options?.color?.dark ?? '#101A32', // JECRC Deep Navy
      light: options?.color?.light ?? '#FFFFFF',
    },
  };

  return QRCode.toDataURL(payload, defaultOptions);
}
