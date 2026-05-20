import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';

const NOT_IMPLEMENTED = { statusCode: 501, message: 'Not implemented' };

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all invoices' })
  findAll(): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an invoice' })
  create(@Body() _body: unknown): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by ID' })
  findOne(@Param('id') _id: string): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  update(@Param('id') _id: string, @Body() _body: unknown): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send an invoice to customer' })
  send(@Param('id') _id: string): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }
}
