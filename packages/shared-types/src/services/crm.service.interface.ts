export abstract class CRMService {
  abstract upsertAccount(accountId: string): Promise<void>;
  abstract recordEvent(input: {
    accountId: string;
    eventType: string;
    payload: Record<string, unknown>;
  }): Promise<void>;
}
