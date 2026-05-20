import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  CreateInvoiceDto,
  UpdateInvoiceDto,
  InvoiceResponseDto,
  CreateInvoiceLineItemDto,
} from '@commfit/shared-types';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all invoices' })
  findAll(
    @Query('accountId') accountId?: string,
    @Query('status') status?: string,
    @Query('jobId') jobId?: string,
    @Query('contractId') contractId?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ): Promise<InvoiceResponseDto[]> {
    return this.invoicesService.findAll({
      accountId,
      status,
      jobId,
      contractId,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an invoice' })
  create(@Body() body: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    return this.invoicesService.create(body);
  }

  @Post('from-job/:jobId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate an invoice from a completed job' })
  generateFromJob(@Param('jobId') jobId: string): Promise<InvoiceResponseDto> {
    return this.invoicesService.generateFromJob(jobId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by ID' })
  findOne(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.update(id, body);
  }

  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send an invoice to customer' })
  send(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.invoicesService.send(id);
  }

  @Post(':id/void')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Void an invoice' })
  void_(@Param('id') id: string): Promise<InvoiceResponseDto> {
    return this.invoicesService.void_(id);
  }

  @Post(':id/record-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a payment for an invoice' })
  recordPayment(
    @Param('id') id: string,
    @Body() body: { amountCents: number; paymentId: string },
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.recordPayment(id, body);
  }

  @Post(':id/line-items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a line item to an invoice' })
  addLineItem(
    @Param('id') id: string,
    @Body() body: CreateInvoiceLineItemDto,
  ): Promise<InvoiceResponseDto> {
    return this.invoicesService.addLineItem(id, body);
  }
}
