import { Request, Response, NextFunction } from 'express';

export const ADMIN_KEY_HEADER = 'x-admin-key';
export const DEFAULT_ADMIN_KEY = 'academia-admin-secret-2026';

/**
 * Admin Authorization Middleware
 * Verifies that the client provided the valid administrative secret key.
 * Accepts:
 *   1. 'x-admin-key' custom header
 *   2. 'Authorization: Bearer <admin_key>' header
 *   3. '?adminKey=<admin_key>' query parameter
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const configuredKey = process.env.ADMIN_SECRET_KEY || DEFAULT_ADMIN_KEY;

  const headerKey = req.headers[ADMIN_KEY_HEADER] as string | undefined;
  const authHeader = req.headers.authorization;
  const queryKey = req.query.adminKey as string | undefined;
  const bodyKey = req.body?.adminKey || req.body?.key;

  const bearerToken =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;

  const providedKey = headerKey || bearerToken || queryKey || bodyKey;

  if (!providedKey || providedKey !== configuredKey) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Valid Admin Secret Key required.',
      code: 'ADMIN_AUTH_REQUIRED',
      hint: `Provide the secret key in the '${ADMIN_KEY_HEADER}' header or as a Bearer token. Default is '${DEFAULT_ADMIN_KEY}'.`,
    });
    return;
  }

  next();
}
