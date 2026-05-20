import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

type AuditLogDto = {
  id: string;
  actorUserId?: string;
  entityType: string;
  entityId: string;
  action: string;
  before?: unknown;
  after?: unknown;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

export interface AuditQueryParams {
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  cursor?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: AuditQueryParams) {
    const {
      entityType,
      entityId,
      actorUserId,
      startDate,
      endDate,
      limit = 50,
      cursor,
    } = params;

    const where: Record<string, unknown> = {};
    if (entityType) where['entityType'] = entityType;
    if (entityId) where['entityId'] = entityId;
    if (actorUserId) where['actorUserId'] = actorUserId;
    if (startDate || endDate) {
      where['createdAt'] = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const findManyArgs = {
      where,
      orderBy: { createdAt: 'desc' as const },
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany(findManyArgs),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items: items.map((log) => this.mapToDto(log)), total };
  }

  private mapToDto(log: { id: string; actorUserId: string | null; entityType: string; entityId: string; action: string; before: unknown; after: unknown; metadata: unknown; createdAt: Date }): AuditLogDto {
    return {
      id: log.id,
      actorUserId: log.actorUserId ?? undefined,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      before: log.before ?? undefined,
      after: log.after ?? undefined,
      metadata: (log.metadata ?? {}) as Record<string, unknown>,
      createdAt: log.createdAt,
    };
  }

  async findOne(id: string): Promise<AuditLogDto> {
    const log = await this.prisma.auditLog.findUnique({ where: { id } });
    if (!log) {
      throw new NotFoundException(`AuditLog ${id} not found`);
    }
    return this.mapToDto(log);
  }

  async create(data: {
    entityType: string;
    entityId: string;
    action: string;
    actorUserId?: string;
    before?: unknown;
    after?: unknown;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        actorUserId: data.actorUserId ?? null,
        before: data.before !== undefined ? (data.before as object) : undefined,
        after: data.after !== undefined ? (data.after as object) : undefined,
        metadata: (data.metadata ?? {}) as object,
      },
    });
  }
}
