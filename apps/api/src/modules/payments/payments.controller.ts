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
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List payments' })
  findAll(
    @Query('accountId') accountId?: string,
    @Query('invoiceId') invoiceId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.paymentsService.findAll({
      accountId,
      invoiceId,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
    });
  }

  @Get('methods/:accountId')
  @ApiOperation({ summary: 'List payment methods for an account' })
  listPaymentMethods(@Param('accountId') accountId: string) {
    return this.paymentsService.listPaymentMethods(accountId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post('collect-method')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Collect a payment method via the payment provider' })
  collectPaymentMethod(@Body() body: { accountId: string }) {
    return this.paymentsService.collectPaymentMethod(body.accountId);
  }

  @Post('charge')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Charge a payment method for an invoice' })
  charge(
    @Body()
    body: {
      invoiceId: string;
      paymentMethodId: string;
      amountCents: number;
      idempotencyKey: string;
    },
  ) {
    return this.paymentsService.charge(body);
  }

  @Post('setup-recurring')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Setup recurring payment for a contract' })
  setupRecurring(@Body() body: { contractId: string; paymentMethodId: string }) {
    return this.paymentsService.setupRecurring(body);
  }

  @Patch('methods/:paymentMethodId/default')
  @ApiOperation({ summary: 'Set a payment method as default' })
  setDefaultPaymentMethod(
    @Param('paymentMethodId') paymentMethodId: string,
    @Body() body: { accountId: string },
  ) {
    return this.paymentsService.setDefaultPaymentMethod(body.accountId, paymentMethodId);
  }
}
