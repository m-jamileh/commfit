import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { TenantScope } from '../middleware/scope.middleware';

const IDEMPOTENT_METHODS = new Set(['POST', 'PATCH', 'PUT']);
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { tenantScope?: TenantScope }>();
    const res = http.getResponse<Response>();

    if (!IDEMPOTENT_METHODS.has(req.method)) {
      return next.handle();
    }

    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
    if (!idempotencyKey) {
      return next.handle();
    }

    const tenantAccountId = req.tenantScope?.accountId ?? 'unknown';
    const compositeKey = `${tenantAccountId}:${req.method}:${req.path}:${idempotencyKey}`;
    const now = new Date();

    const existing = await this.prisma.idempotencyRecord.findUnique({
      where: { key: compositeKey },
    });

    if (existing && existing.expiresAt > now) {
      const cached = existing.response as unknown;
      res.json(cached);
      return of(cached);
    }

    return next.handle().pipe(
      tap((responseBody) => {
        const expiresAt = new Date(now.getTime() + TTL_MS);
        this.prisma.idempotencyRecord
          .upsert({
            where: { key: compositeKey },
            create: {
              key: compositeKey,
              response: responseBody as object,
              expiresAt,
            },
            update: {
              response: responseBody as object,
              expiresAt,
            },
          })
          .catch(() => {
            // Fire-and-forget; do not break the response on cache failure
          });
      }),
    );
  }
}
