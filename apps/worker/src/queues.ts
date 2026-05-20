export const QUEUE_NAMES = {
  EMAIL_DISPATCH: 'email-dispatch',
  SCHEDULED_PM_ROLLOVER: 'scheduled-pm-rollover',
  RECURRING_AUTOPAY_SIMULATION: 'recurring-autopay-simulation',
  COMMISSION_RECOMPUTE: 'commission-recompute',
  AUDIT_ASYNC: 'audit-async',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export interface EmailDispatchPayload {
  to: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface CommissionRecomputePayload {
  invoiceId: string;
  triggeredByUserId?: string;
}

export interface AuditAsyncPayload {
  entityType: string;
  entityId: string;
  action: string;
  actorUserId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

export interface RecurringAutopaySimulationPayload {
  contractId: string;
  paymentMethodId: string;
  amountCents: number;
}

export interface ScheduledPmRolloverPayload {
  contractId: string;
  periodStart: string;
}
