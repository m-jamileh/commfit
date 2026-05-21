import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateJobDto, UpdateJobDto, JobResponseDto, JobStatus } from '@commfit/shared-types';
import { JobsService } from './jobs.service';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'List all jobs' })
  findAll(
    @Query('accountId') accountId?: string,
    @Query('locationId') locationId?: string,
    @Query('technicianId') technicianId?: string,
    @Query('status') status?: string,
    @Query('jobType') jobType?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ): Promise<JobResponseDto[]> {
    return this.jobsService.findAll({
      accountId,
      locationId,
      technicianId,
      status,
      jobType,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a job' })
  create(@Body() body: CreateJobDto): Promise<JobResponseDto> {
    return this.jobsService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by ID' })
  findOne(@Param('id') id: string): Promise<JobResponseDto> {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a job' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateJobDto,
  ): Promise<JobResponseDto> {
    return this.jobsService.update(id, body);
  }

  @Post(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign a technician to a job' })
  assign(
    @Param('id') id: string,
    @Body() body: { technicianId: string },
  ): Promise<JobResponseDto> {
    return this.jobsService.assign(id, body);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete a job with signoff' })
  complete(
    @Param('id') id: string,
    @Body() body: { signerName: string; signerEmail: string },
  ): Promise<JobResponseDto> {
    return this.jobsService.complete(id, body);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a job' })
  cancel(@Param('id') id: string): Promise<JobResponseDto> {
    return this.jobsService.cancel(id);
  }

  @Post(':id/photos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a photo to a job' })
  addPhoto(
    @Param('id') id: string,
    @Body()
    body: {
      url: string;
      caption?: string;
      equipmentId?: string;
      uploadedByUserId?: string;
    },
  ): Promise<Record<string, unknown>> {
    return this.jobsService.addPhoto(id, body);
  }

  @Post(':id/parts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a part to a job' })
  addPart(
    @Param('id') id: string,
    @Body() body: { partId: string; quantity: number; unitCostCents: number },
  ): Promise<Record<string, unknown>> {
    return this.jobsService.addPart(id, body);
  }

  @Post(':id/transition')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transition job status' })
  transition(
    @Param('id') id: string,
    @Body() body: { status: JobStatus },
  ): Promise<JobResponseDto> {
    return this.jobsService.transition(id, body.status);
  }
}
