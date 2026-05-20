export class AuditLogResponseDto {
  id!: string;
  actorUserId?: string;
  entityType!: string;
  entityId!: string;
  action!: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata!: Record<string, unknown>;
  createdAt!: Date;
}
