import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications' })
  findAll(
    @Query('userId') userId?: string,
    @Query('templateKey') templateKey?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.notificationsService.findAll({
      userId,
      templateKey,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
    });
  }

  @Get('email-inbox')
  @ApiOperation({ summary: 'List email inbox records' })
  listEmailInbox(
    @Query('toEmail') toEmail?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.notificationsService.listEmailInbox({
      toEmail,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a notification via template' })
  send(
    @Body()
    body: {
      userId: string;
      templateKey: string;
      data: Record<string, unknown>;
      channels?: string[];
    },
  ) {
    return this.notificationsService.notify(body);
  }
}
