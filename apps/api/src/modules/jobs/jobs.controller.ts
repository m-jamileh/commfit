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
import { JobsService } from './jobs.service';

const NOT_IMPLEMENTED = { statusCode: 501, message: 'Not implemented' };

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'List all jobs' })
  findAll(): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a job' })
  create(@Body() _body: unknown): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by ID' })
  findOne(@Param('id') _id: string): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a job' })
  update(@Param('id') _id: string, @Body() _body: unknown): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign a technician to a job' })
  assign(@Param('id') _id: string, @Body() _body: unknown): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a job as completed' })
  complete(@Param('id') _id: string): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a job' })
  cancel(@Param('id') _id: string): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }
}
