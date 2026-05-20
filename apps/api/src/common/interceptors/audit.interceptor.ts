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

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

// Extracts entity id from path params (last UUID segment or param id)
function extractEntityId(req: Request): string {
  const params = req.params as Record<string, string>;
  return params['id'] ?? params['0'] ?? req.path;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: { id?: string } }>();
    const res = http.getResponse<Response>();

    if (!MUTATING_METHODS.has(req.method)) {
      return next.handle();
    }

    const actorUserId: string | null = req['user']?.id ?? null;
    const entityType = req.path.split('/')[2] ?? req.path;
    const entityId = extractEntityId(req);
    const action = req.method;

    return next.handle().pipe(
      tap(() => {
        if (res.statusCode === 501) {
          return;
        }

        const after = { statusCode: res.statusCode, path: req.path, method: req.method };

        this.prisma.auditLog
          .create({
            data: {
              actorUserId,
              entityType,
              entityId,
              action,
              before: undefined,
              after,
              metadata: {},
            },
          })
          .catch(() => {});
      }),
    );
  }
}
