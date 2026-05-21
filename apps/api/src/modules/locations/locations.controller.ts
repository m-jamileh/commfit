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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import {
  CreateLocationDto,
  LocationResponseDto,
  PaginatedResponseDto,
  PaginationQueryDto,
  UpdateLocationDto,
} from '@commfit/shared-types';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all locations (paginated)' })
  findAll(
    @Query() query: PaginationQueryDto,
    @Query('accountId') queryAccountId?: string,
    @Req() req?: Request,
  ): Promise<PaginatedResponseDto<LocationResponseDto>> {
    const accountId =
      queryAccountId ?? (req as Request)?.tenantScope?.accountId ?? '';
    return this.locationsService.findAll(accountId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a location' })
  create(@Body() body: CreateLocationDto): Promise<LocationResponseDto> {
    return this.locationsService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by ID' })
  findOne(
    @Param('id') id: string,
    @Query('accountId') queryAccountId?: string,
    @Req() req?: Request,
  ): Promise<LocationResponseDto> {
    const accountId =
      queryAccountId ?? (req as Request)?.tenantScope?.accountId;
    return this.locationsService.findOne(id, accountId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a location' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateLocationDto,
  ): Promise<LocationResponseDto> {
    return this.locationsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a location' })
  archive(@Param('id') id: string): Promise<LocationResponseDto> {
    return this.locationsService.archive(id);
  }
}
