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
import { CommissionService } from './commission.service';

const NOT_IMPLEMENTED = { statusCode: 501, message: 'Not implemented' };

@ApiTags('commission')
@Controller('commission')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get('rules')
  @ApiOperation({ summary: 'List commission rules' })
  findAllRules(): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Post('rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a commission rule' })
  createRule(@Body() _body: unknown): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Update a commission rule' })
  updateRule(@Param('id') _id: string, @Body() _body: unknown): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Get('earnings')
  @ApiOperation({ summary: 'List commission earnings' })
  findAllEarnings(): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Post('compute-preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview commission computation without persisting' })
  computePreview(@Body() _body: unknown): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }
}
