export type NotificationTemplateKey =
  | 'job_assigned'
  | 'job_completed'
  | 'job_cancelled'
  | 'quote_sent'
  | 'quote_signed'
  | 'contract_sent'
  | 'contract_signed'
  | 'invoice_sent'
  | 'invoice_overdue'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'sr_submitted'
  | 'pm_reminder'
  | 'commission_paid'
  | 'welcome';

export abstract class NotificationService {
  abstract notify(input: {
    userId: string;
    templateKey: NotificationTemplateKey;
    data: Record<string, unknown>;
    channels?: ('email' | 'sms')[];
  }): Promise<void>;
}
