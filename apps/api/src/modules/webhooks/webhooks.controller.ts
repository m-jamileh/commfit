import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('esign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive eSign webhook events' })
  esign(
    @Body()
    body: {
      envelopeId: string;
      event: string;
      signedAt?: string;
      signerName?: string;
    },
    @Headers('x-esign-signature') signature: string = '',
    @Req() req: Request,
  ) {
    const rawBody =
      typeof req.body === 'string' ? req.body : JSON.stringify(body);
    return this.webhooksService.handleESignEvent(body, signature, rawBody);
  }

  @Post('payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive payment webhook events' })
  payment(
    @Body()
    body: {
      paymentId: string;
      event: string;
      status: string;
      failureReason?: string;
    },
    @Headers('x-payment-signature') signature: string = '',
    @Req() req: Request,
  ) {
    const rawBody =
      typeof req.body === 'string' ? req.body : JSON.stringify(body);
    return this.webhooksService.handlePaymentEvent(body, signature, rawBody);
  }
}
