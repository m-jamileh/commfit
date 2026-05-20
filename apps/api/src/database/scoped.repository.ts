import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export interface ScopedFilter {
  accountId: string;
  locationId?: string;
}

export type WithScope<T extends Record<string, unknown>> = T & ScopedFilter;

@Injectable()
export abstract class ScopedRepository {
  constructor(protected readonly prisma: PrismaService) {}

  protected scoped(accountId: string, locationId?: string): ScopedFilter {
    return { accountId, ...(locationId ? { locationId } : {}) };
  }

  protected scopedWhere<T extends Record<string, unknown>>(
    accountId: string,
    extra?: T,
    locationId?: string,
  ): WithScope<T> {
    return {
      accountId,
      ...(locationId ? { locationId } : {}),
      ...(extra ?? {}),
    } as WithScope<T>;
  }
}
