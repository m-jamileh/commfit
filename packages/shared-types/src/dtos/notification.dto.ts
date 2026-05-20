import { NotificationTemplateKey } from '../services/notification.service.interface';

export type NotificationChannel = 'email' | 'sms';
export type NotificationStatus = 'pending' | 'delivered' | 'failed';

export class NotificationResponseDto {
  id!: string;
  userId?: string;
  templateKey!: NotificationTemplateKey;
  channel!: NotificationChannel;
  status!: NotificationStatus;
  payload!: Record<string, unknown>;
  error?: string;
  metadata!: Record<string, unknown>;
  createdAt!: Date;
  updatedAt!: Date;
}

export class SendNotificationDto {
  userId!: string;
  templateKey!: NotificationTemplateKey;
  data!: Record<string, unknown>;
  channels?: NotificationChannel[];
}
