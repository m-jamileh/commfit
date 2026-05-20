import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AccountResponseDto,
  CreateAccountDto,
  UpdateAccountDto,
} from '@commfit/shared-types';
import { PrismaService } from '../../database/prisma.service';
import type { Account } from '@commfit/db';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(accountId?: string): Promise<AccountResponseDto[]> {
    const where = accountId ? { id: accountId } : {};
    const accounts = await this.prisma.account.findMany({ where });
    return accounts.map((a) => this.mapToDto(a));
  }

  async findOne(id: string): Promise<AccountResponseDto> {
    const account = await this.prisma.account.findUnique({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account ${id} not found`);
    }
    return this.mapToDto(account);
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
    return this.mapToDto(account);
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
    return this.mapToDto(account);
  }

  async archive(id: string): Promise<AccountResponseDto> {
    await this.findOne(id);
    const account = await this.prisma.account.update({
      where: { id },
      data: { status: 'archived' },
    });
    return this.mapToDto(account);
  }

  private mapToDto(account: Account): AccountResponseDto {
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
}
