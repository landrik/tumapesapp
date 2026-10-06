import { Request, Response, NextFunction } from 'express';
import { verify, AuthTokenPayload } from '../utils/jwt';
import { error } from '../utils/response';

// Augment Express's Request type globally so req.user is typed
// everywhere without needing a local interface in every controller.
declare global {
  namespace Express {
    interface Request {
      user: AuthTokenPayload;
    }
  }
}

/**
 * Middleware: extract Bearer token from Authorization header,
 * verify it, and attach decoded user to req.user.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    error(res, 'Authorization token required', 401, 'UNAUTHORIZED');
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = verify(token);
    req.user = decoded;
    next();
  } catch (err) {
    error(res, 'Invalid or expired token', 401, 'TOKEN_INVALID');
    return;
  }
};
