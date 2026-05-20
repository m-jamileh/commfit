import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateContractDto,
  UpdateContractDto,
  ContractResponseDto,
} from '@commfit/shared-types';
import { PrismaService } from '../../database/prisma.service';
import { ESignService } from '../../services/esign/esign.service';
import type { Contract, ContractProperty } from '@commfit/db';

type ContractWithProperties = Contract & { properties: ContractProperty[] };

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly esignService: ESignService,
  ) {}

  async findAll(query: {
    accountId?: string;
    status?: string;
    serviceType?: string;
    limit?: number;
    cursor?: string;
  }): Promise<ContractResponseDto[]> {
    const { accountId, status, serviceType, limit, cursor } = query;
    const contracts = await this.prisma.contract.findMany({
      where: {
        ...(accountId ? { accountId } : {}),
        ...(status ? { status: status as Contract['status'] } : {}),
        ...(serviceType ? { serviceType: serviceType as Contract['serviceType'] } : {}),
      },
      include: { properties: true },
      orderBy: { createdAt: 'desc' },
      take: limit ?? 50,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    return contracts.map((c) => this.mapToDto(c));
  }

  async findOne(id: string): Promise<ContractResponseDto> {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { properties: true },
    });
    if (!contract) {
      throw new NotFoundException(`Contract ${id} not found`);
    }
    return this.mapToDto(contract);
  }

  async create(dto: CreateContractDto): Promise<ContractResponseDto> {
    const locationIds = (dto as unknown as { locationIds?: string[] }).locationIds
      ?? dto.propertyIds
      ?? [];
    const contract = await this.prisma.contract.create({
      data: {
        accountId: dto.accountId,
        createdByUserId: (dto as unknown as { createdByUserId?: string }).createdByUserId ?? null,
        title: dto.title,
        serviceType: dto.serviceType,
        cadence: dto.cadence,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        autoRenew: dto.autoRenew ?? false,
        autoPay: dto.autoPay ?? false,
        paymentMethodId: dto.paymentMethodId ?? null,
        totalValueCents: dto.totalValueCents ? BigInt(dto.totalValueCents) : BigInt(0),
        metadata: (dto.metadata ?? {}) as object,
        ...(locationIds.length > 0
          ? {
              properties: {
                create: locationIds.map((locationId) => ({ locationId })),
              },
            }
          : {}),
      },
      include: { properties: true },
    });

    return this.mapToDto(contract);
  }

  async update(id: string, dto: UpdateContractDto): Promise<ContractResponseDto> {
    await this.findOne(id);
    const contract = await this.prisma.contract.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.serviceType !== undefined && { serviceType: dto.serviceType }),
        ...(dto.cadence !== undefined && { cadence: dto.cadence }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.autoRenew !== undefined && { autoRenew: dto.autoRenew }),
        ...(dto.autoPay !== undefined && { autoPay: dto.autoPay }),
        ...(dto.paymentMethodId !== undefined && { paymentMethodId: dto.paymentMethodId }),
        ...(dto.totalValueCents !== undefined && {
          totalValueCents: BigInt(dto.totalValueCents),
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata as object }),
      },
      include: { properties: true },
    });
    return this.mapToDto(contract);
  }

  async send(
    id: string,
    data: { signerEmail: string; signerName: string },
  ): Promise<ContractResponseDto> {
    await this.findOne(id);

    const envelope = await this.esignService.createEnvelope({
      documentId: id,
      signerEmail: data.signerEmail,
      signerName: data.signerName,
    });

    const contract = await this.prisma.contract.update({
      where: { id },
      data: {
        status: 'sent',
        docusignEnvelopeId: envelope.envelopeId,
      },
      include: { properties: true },
    });
    return this.mapToDto(contract);
  }

  async sign(id: string): Promise<ContractResponseDto> {
    await this.findOne(id);
    const contract = await this.prisma.contract.update({
      where: { id },
      data: {
        status: 'signed',
        signedAt: new Date(),
      },
      include: { properties: true },
    });
    return this.mapToDto(contract);
  }

  async terminate(id: string): Promise<ContractResponseDto> {
    await this.findOne(id);
    const contract = await this.prisma.contract.update({
      where: { id },
      data: { status: 'terminated' },
      include: { properties: true },
    });
    return this.mapToDto(contract);
  }

  async addProperty(contractId: string, locationId: string): Promise<ContractResponseDto> {
    const existing = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!existing) {
      throw new NotFoundException(`Contract ${contractId} not found`);
    }
    await this.prisma.contractProperty.create({
      data: { contractId, locationId },
    });
    return this.findOne(contractId);
  }

  async removeProperty(contractId: string, locationId: string): Promise<ContractResponseDto> {
    const existing = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!existing) {
      throw new NotFoundException(`Contract ${contractId} not found`);
    }
    await this.prisma.contractProperty.deleteMany({
      where: { contractId, locationId },
    });
    return this.findOne(contractId);
  }

  private mapToDto(contract: ContractWithProperties): ContractResponseDto {
    return {
      id: contract.id,
      accountId: contract.accountId,
      createdByUserId: contract.createdByUserId ?? undefined,
      title: contract.title,
      serviceType: contract.serviceType as ContractResponseDto['serviceType'],
      cadence: contract.cadence as ContractResponseDto['cadence'],
      startDate: contract.startDate.toISOString().split('T')[0],
      endDate: contract.endDate.toISOString().split('T')[0],
      autoRenew: contract.autoRenew,
      autoPay: contract.autoPay,
      paymentMethodId: contract.paymentMethodId ?? undefined,
      totalValueCents: Number(contract.totalValueCents),
      docusignEnvelopeId: contract.docusignEnvelopeId ?? undefined,
      signedAt: contract.signedAt ?? undefined,
      status: contract.status as ContractResponseDto['status'],
      propertyIds: contract.properties.map((p) => p.locationId),
      metadata: contract.metadata as Record<string, unknown>,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
  }
}
