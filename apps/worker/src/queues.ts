// Queue names (use these string constants everywhere — never hardcode queue name strings)
export const QUEUE_NAMES = {
  EMAIL_DISPATCH: 'email-dispatch',
  SCHEDULED_PM_ROLLOVER: 'scheduled-pm-rollover',
  RECURRING_AUTOPAY_SIMULATION: 'recurring-autopay-simulation',
  COMMISSION_RECOMPUTE: 'commission-recompute',
  AUDIT_ASYNC: 'audit-async',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// Job payload types per queue

export interface EmailDispatchPayload {
  to: string;
  subject: string;
  body: string;
  templateKey?: string;
  metadata?: Record<string, unknown>;
}

export interface ScheduledPmRolloverPayload {
  contractId: string;
  /** ISO date string for the quarter start being rolled over */
  periodStart: string;
}

export interface RecurringAutopaySimulationPayload {
  contractId: string;
  paymentMethodId: string;
  amountCents: number;
  idempotencyKey: string;
}

export interface CommissionRecomputePayload {
  invoiceId: string;
  triggeredByUserId?: string;
}

export interface AuditAsyncPayload {
  actorUserId?: string;
  entityType: string;
  entityId: string;
  action: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export type QueuePayloadMap = {
  [QUEUE_NAMES.EMAIL_DISPATCH]: EmailDispatchPayload;
  [QUEUE_NAMES.SCHEDULED_PM_ROLLOVER]: ScheduledPmRolloverPayload;
  [QUEUE_NAMES.RECURRING_AUTOPAY_SIMULATION]: RecurringAutopaySimulationPayload;
  [QUEUE_NAMES.COMMISSION_RECOMPUTE]: CommissionRecomputePayload;
  [QUEUE_NAMES.AUDIT_ASYNC]: AuditAsyncPayload;
};

// Processor file paths (relative to apps/worker/src/processors/)
export const PROCESSOR_PATHS = {
  [QUEUE_NAMES.EMAIL_DISPATCH]: './processors/email-dispatch.processor',
  [QUEUE_NAMES.SCHEDULED_PM_ROLLOVER]: './processors/scheduled-pm-rollover.processor',
  [QUEUE_NAMES.RECURRING_AUTOPAY_SIMULATION]: './processors/recurring-autopay-simulation.processor',
  [QUEUE_NAMES.COMMISSION_RECOMPUTE]: './processors/commission-recompute.processor',
  [QUEUE_NAMES.AUDIT_ASYNC]: './processors/audit-async.processor',
} as const;

// Dead-letter queue suffix convention
export const DLQ_SUFFIX = ':dlq';
export const toDlqName = (queueName: QueueName): string => `${queueName}${DLQ_SUFFIX}`;
