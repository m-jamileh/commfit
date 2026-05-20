import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

function bigIntReplacer(_: string, v: unknown): unknown {
  return typeof v === 'bigint' ? v.toString() : v;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(@InjectQueue('audit-async') private readonly auditQueue: Queue) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method;

    if (!MUTATING_METHODS.has(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (responseBody) => {
        const entityId =
          req.params?.id ?? (responseBody as { id?: string })?.id;
        const controllerClass = context.getClass().name;
        const entityType = controllerClass.replace('Controller', '').toLowerCase();

        await this.auditQueue
          .add('audit-async', {
            entityType,
            entityId: entityId ?? 'unknown',
            action: method.toLowerCase(),
            actorUserId: (req as Request & { user?: { id?: string } }).user?.id,
            after: responseBody
              ? JSON.parse(JSON.stringify(responseBody, bigIntReplacer))
              : undefined,
          })
          .catch(() => {
            // Fire-and-forget; do not break the response on audit failure
          });
      }),
    );
  }
}
