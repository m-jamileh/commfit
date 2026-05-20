import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantScope {
  accountId: string;
  locationId?: string;
}

declare global {
  namespace Express {
    interface Request {
      tenantScope?: TenantScope;
    }
  }
}

@Injectable()
export class ScopeMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const user = (req as unknown as Record<string, unknown>)['user'] as Record<string, unknown> | undefined;

    if (user) {
      const accountId =
        (user['account_id'] as string | undefined) ??
        (req.query['accountId'] as string | undefined);
      const locationId = user['location_id'] as string | undefined;

      if (accountId) {
        req.tenantScope = { accountId, ...(locationId ? { locationId } : {}) };
      }
    }

    next();
  }
}

export function requireTenantScope(req: Request): TenantScope {
  if (!req.tenantScope?.accountId) {
    throw new ForbiddenException('Tenant scope not resolved');
  }
  return req.tenantScope;
}
