import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AccountResponseDto,
  CreateAccountDto,
  PaginatedResponseDto,
  PaginationQueryDto,
  UpdateAccountDto,
} from '@commfit/shared-types';
import { PrismaService } from '../../database/prisma.service';
import type { Account } from '@commfit/db';

export function toAccountDto(account: Account): AccountResponseDto {
  return {
    id: account.id,
    name: account.name,
    billingEmail: account.billingEmail,
    billingPhone: account.billingPhone ?? undefined,
    billingAddress: account.billingAddress ?? undefined,
    city: account.city ?? undefined,
    state: account.state ?? undefined,
    zip: account.zip ?? undefined,
    stripeCustomerId: account.stripeCustomerId ?? undefined,
    status: account.status as 'active' | 'archived',
    metadata: account.metadata as Record<string, unknown>,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<AccountResponseDto>> {
    const limit = query.limit ?? 50;
    const cursor = query.cursor;

    const [items, total] = await Promise.all([
      this.prisma.account.findMany({
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      this.prisma.account.count({ where: { status: 'active' } }),
    ]);

    const hasMore = items.length > limit;
    if (hasMore) items.pop();
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return new PaginatedResponseDto(items.map(toAccountDto), nextCursor, total);
  }

  async findOne(id: string): Promise<AccountResponseDto> {
    const account = await this.prisma.account.findUnique({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account ${id} not found`);
    }
    return toAccountDto(account);
  }

  async create(dto: CreateAccountDto): Promise<AccountResponseDto> {
    const account = await this.prisma.account.create({
      data: {
        name: dto.name,
        billingEmail: dto.billingEmail,
        billingPhone: dto.billingPhone,
        billingAddress: dto.billingAddress,
        city: dto.city,
        state: dto.state,
        zip: dto.zip,
        metadata: (dto.metadata ?? {}) as object,
      },
    });
    return toAccountDto(account);
  }

  async update(id: string, dto: UpdateAccountDto): Promise<AccountResponseDto> {
    await this.findOne(id);
    const account = await this.prisma.account.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.billingEmail !== undefined && { billingEmail: dto.billingEmail }),
        ...(dto.billingPhone !== undefined && { billingPhone: dto.billingPhone }),
        ...(dto.billingAddress !== undefined && { billingAddress: dto.billingAddress }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.zip !== undefined && { zip: dto.zip }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as object }),
      },
    });
    return toAccountDto(account);
  }

  async archive(id: string): Promise<AccountResponseDto> {
    await this.findOne(id);
    const account = await this.prisma.account.update({
      where: { id },
      data: { status: 'archived' },
    });
    return toAccountDto(account);
  }

  async addUser(
    accountId: string,
    userId: string,
    role: 'admin' | 'user',
  ): Promise<void> {
    await this.prisma.accountUser.create({
      data: {
        accountId,
        userId,
        role,
      },
    });
  }

  async removeUser(accountId: string, userId: string): Promise<void> {
    await this.prisma.accountUser.updateMany({
      where: { accountId, userId },
      data: { status: 'archived' },
    });
  }
}
