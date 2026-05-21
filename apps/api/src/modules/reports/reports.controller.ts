import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue summary with monthly breakdown' })
  getRevenueSummary(
    @Query('accountId') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getRevenueSummary({ accountId, startDate, endDate });
  }

  @Get('job-pipeline')
  @ApiOperation({ summary: 'Job pipeline counts by status, type, priority' })
  getJobPipeline(
    @Query('accountId') accountId?: string,
    @Query('technicianId') technicianId?: string,
  ) {
    return this.reportsService.getJobPipeline({ accountId, technicianId });
  }

  @Get('tech-performance')
  @ApiOperation({ summary: 'Technician performance: jobs, completion rate, commission' })
  getTechPerformance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getTechPerformance({ startDate, endDate });
  }

  @Get('equipment-health')
  @ApiOperation({ summary: 'Equipment health: condition breakdown, warranty status' })
  getEquipmentHealth(
    @Query('accountId') accountId?: string,
    @Query('locationId') locationId?: string,
  ) {
    return this.reportsService.getEquipmentHealth({ accountId, locationId });
  }

  @Get('commission-summary')
  @ApiOperation({ summary: 'Commission earnings summary per technician' })
  getCommissionSummary(
    @Query('technicianId') technicianId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getCommissionSummary({
      technicianId,
      startDate,
      endDate,
    });
  }

  @Get('account-overview')
  @ApiOperation({ summary: 'High-level account overview: locations, equipment, jobs, invoices' })
  getAccountOverview(@Query('accountId') accountId: string) {
    return this.reportsService.getAccountOverview(accountId);
  }

  // Legacy endpoints
  @Get('service-history-per-location')
  @ApiOperation({ summary: 'Service history grouped by location' })
  getServiceHistoryPerLocation(
    @Query('accountId') accountId: string,
    @Query('locationId') locationId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getServiceHistoryPerLocation(
      accountId,
      locationId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('spend-per-account')
  @ApiOperation({ summary: 'Total spend aggregated per account' })
  getSpendPerAccount(
    @Query('accountId') accountId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getSpendPerAccount(
      accountId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('equipment-condition-summary')
  @ApiOperation({ summary: 'Equipment condition breakdown by class' })
  getEquipmentConditionSummary(@Query('accountId') accountId: string) {
    return this.reportsService.getEquipmentConditionSummary(accountId);
  }

  @Get('jobs-per-technician')
  @ApiOperation({ summary: 'Job count grouped by technician' })
  getJobsPerTechnician(
    @Query('accountId') accountId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reportsService.getJobsPerTechnician(
      accountId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get('invoice-aging-summary')
  @ApiOperation({ summary: 'Invoice aging buckets for an account' })
  getInvoiceAgingSummary(@Query('accountId') accountId: string) {
    return this.reportsService.getInvoiceAgingSummary(accountId);
  }
}
