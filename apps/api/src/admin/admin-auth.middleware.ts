import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const adminKey = process.env.BULL_BOARD_ADMIN_KEY;
    if (!adminKey) {
      res.status(503).json({ error: { code: 'ADMIN_DISABLED', message: 'Admin key not configured' } });
      return;
    }
    const providedKey = req.headers['x-admin-key'] as string | undefined;
    if (providedKey !== adminKey) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid admin key' } });
      return;
    }
    next();
  }
}
