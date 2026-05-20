import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

const NOT_IMPLEMENTED = { statusCode: 501, message: 'Not implemented' };

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('service-history')
  @ApiOperation({ summary: 'Service history report' })
  serviceHistory(): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Get('spend')
  @ApiOperation({ summary: 'Spend report by account/location' })
  spend(): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Get('equipment-age')
  @ApiOperation({ summary: 'Equipment age and condition report' })
  equipmentAge(): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Get('tech-performance')
  @ApiOperation({ summary: 'Technician performance report' })
  techPerformance(): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Get('pm-compliance')
  @ApiOperation({ summary: 'PM compliance report' })
  pmCompliance(): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Get('sr-turnaround')
  @ApiOperation({ summary: 'Service request turnaround report' })
  srTurnaround(): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }
}
