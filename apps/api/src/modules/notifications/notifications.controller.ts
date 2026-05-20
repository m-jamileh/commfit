import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

const NOT_IMPLEMENTED = { statusCode: 501, message: 'Not implemented' };

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user' })
  findAll(): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a notification' })
  send(@Body() _body: unknown): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }
}
