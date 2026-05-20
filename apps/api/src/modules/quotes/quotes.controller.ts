import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateQuoteDto, UpdateQuoteDto, QuoteResponseDto, CreateQuoteLineItemDto } from '@commfit/shared-types';
import { QuotesService } from './quotes.service';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @ApiOperation({ summary: 'List all quotes' })
  findAll(
    @Query('accountId') accountId?: string,
    @Query('locationId') locationId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ): Promise<QuoteResponseDto[]> {
    return this.quotesService.findAll({
      accountId,
      locationId,
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a quote' })
  create(@Body() body: CreateQuoteDto): Promise<QuoteResponseDto> {
    return this.quotesService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quote by ID' })
  findOne(@Param('id') id: string): Promise<QuoteResponseDto> {
    return this.quotesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quote' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateQuoteDto,
  ): Promise<QuoteResponseDto> {
    return this.quotesService.update(id, body);
  }

  @Post(':id/line-items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a line item to a quote' })
  addLineItem(
    @Param('id') id: string,
    @Body() body: CreateQuoteLineItemDto,
  ): Promise<QuoteResponseDto> {
    return this.quotesService.addLineItem(id, body);
  }

  @Delete(':id/line-items/:lineItemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a line item from a quote' })
  removeLineItem(
    @Param('lineItemId') lineItemId: string,
  ): Promise<QuoteResponseDto> {
    return this.quotesService.removeLineItem(lineItemId);
  }

  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a quote to customer' })
  send(@Param('id') id: string): Promise<QuoteResponseDto> {
    return this.quotesService.send(id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a quote' })
  cancel(@Param('id') id: string): Promise<QuoteResponseDto> {
    return this.quotesService.cancel(id);
  }
}
