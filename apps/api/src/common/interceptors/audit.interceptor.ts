import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { TenantScope } from '../middleware/scope.middleware';

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: { id?: string }; tenantScope?: TenantScope }>();
    const res = http.getResponse<Response>();

    if (!MUTATING_METHODS.has(req.method)) {
      return next.handle();
    }

    const tenantScope = req.tenantScope;
    const actorId: string | null = req['user']?.id ?? null;
    const entityType = req.url;
    const action = req.method;

    return next.handle().pipe(
      tap(() => {
        const statusCode = res.statusCode;

        if (statusCode === 501) {
          return;
        }

        const after = { statusCode, path: req.url, method: req.method };

        this.prisma.auditLog
          .create({
            data: {
              tenantAccountId: tenantScope?.accountId ?? 'unknown',
              actorId,
              entityType,
              entityId: null,
              action,
              before: null,
              after,
            },
          })
          .catch(() => {
            // Fire-and-forget; do not break the response on audit failure
          });
      }),
    );
  }
}
