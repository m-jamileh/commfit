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
import { CommissionService } from './commission.service';
import {
  CreateCommissionRuleDto,
  UpdateCommissionRuleDto,
} from '@commfit/shared-types';

@ApiTags('commission')
@Controller('commission')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  // Rules
  @Get('rules')
  @ApiOperation({ summary: 'List commission rules' })
  findRules(@Query('active') _active?: string) {
    return this.commissionService.listRules();
  }

  @Post('rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a commission rule' })
  createRule(@Body() body: CreateCommissionRuleDto) {
    return this.commissionService.createRule(body);
  }

  @Get('rules/:id')
  @ApiOperation({ summary: 'Get a commission rule by ID' })
  findOneRule(@Param('id') id: string) {
    return this.commissionService.findOneRule(id);
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Update a commission rule' })
  updateRule(@Param('id') id: string, @Body() body: UpdateCommissionRuleDto) {
    return this.commissionService.updateRule(id, body);
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Deactivate a commission rule (soft delete)' })
  deleteRule(@Param('id') id: string) {
    return this.commissionService.deleteRule(id);
  }

  // Earnings
  @Get('earnings')
  @ApiOperation({ summary: 'List commission earnings' })
  findEarnings(
    @Query('technicianId') technicianId?: string,
    @Query('invoiceId') invoiceId?: string,
    @Query('status') _status?: string,
  ) {
    return this.commissionService.listEarnings(technicianId, invoiceId);
  }

  @Get('earnings/:id')
  @ApiOperation({ summary: 'Get a commission earning by ID' })
  findOneEarning(@Param('id') id: string) {
    return this.commissionService.findOneEarning(id);
  }

  @Post('earnings/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a pending commission earning' })
  approveEarning(@Param('id') id: string) {
    return this.commissionService.approveEarning(id);
  }

  @Post('earnings/:id/mark-paid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark an approved commission earning as paid' })
  markEarningPaid(@Param('id') id: string) {
    return this.commissionService.markEarningPaid(id);
  }

  // Preview
  @Post('compute-preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dry-run commission computation without persisting' })
  computePreview(@Body() body: { invoiceId: string }) {
    return this.commissionService.computePreview(body.invoiceId);
  }
}
