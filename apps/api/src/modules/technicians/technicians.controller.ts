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
import {
  CreateTechnicianDto,
  PaginatedResponseDto,
  PaginationQueryDto,
  TechnicianResponseDto,
  UpdateTechnicianDto,
} from '@commfit/shared-types';
import { TechniciansService } from './technicians.service';

class AddCertificationDto {
  equipmentClass!: string;
  certifiedAt!: string;
  notes?: string;
}

class UpdateLoadDto {
  load!: number;
}

@ApiTags('technicians')
@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  @ApiOperation({ summary: 'List all technicians (paginated)' })
  findAll(
    @Query() query: PaginationQueryDto,
    @Query('region') region?: string,
    @Query('techType') techType?: string,
    @Query('availabilityStatus') availabilityStatus?: string,
  ): Promise<PaginatedResponseDto<TechnicianResponseDto>> {
    return this.techniciansService.findAll({
      ...query,
      region,
      techType,
      availabilityStatus,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a technician' })
  create(@Body() body: CreateTechnicianDto): Promise<TechnicianResponseDto> {
    return this.techniciansService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a technician by ID' })
  findOne(@Param('id') id: string): Promise<TechnicianResponseDto> {
    return this.techniciansService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a technician' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateTechnicianDto,
  ): Promise<TechnicianResponseDto> {
    return this.techniciansService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a technician' })
  archive(@Param('id') id: string): Promise<TechnicianResponseDto> {
    return this.techniciansService.archive(id);
  }

  @Post(':id/certifications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a certification to a technician' })
  addCertification(
    @Param('id') id: string,
    @Body() body: AddCertificationDto,
  ): Promise<TechnicianResponseDto> {
    return this.techniciansService.addCertification(id, body);
  }

  @Delete(':id/certifications/:certificationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a certification from a technician' })
  removeCertification(
    @Param('certificationId') certificationId: string,
  ): Promise<void> {
    return this.techniciansService.removeCertification(certificationId);
  }

  @Patch(':id/load')
  @ApiOperation({ summary: 'Update technician load and availability status' })
  updateLoad(
    @Param('id') id: string,
    @Body() body: UpdateLoadDto,
  ): Promise<TechnicianResponseDto> {
    return this.techniciansService.updateLoad(id, body.load);
  }
}
