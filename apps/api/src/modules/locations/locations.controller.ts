import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import {
  CreateLocationDto,
  LocationResponseDto,
  UpdateLocationDto,
} from '@commfit/shared-types';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all locations' })
  findAll(@Req() req: Request): Promise<LocationResponseDto[]> {
    const accountId = req.tenantScope?.accountId ?? '';
    return this.locationsService.findAll(accountId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a location' })
  create(@Body() body: CreateLocationDto): Promise<LocationResponseDto> {
    return this.locationsService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by ID' })
  findOne(@Param('id') id: string, @Req() req: Request): Promise<LocationResponseDto> {
    const accountId = req.tenantScope?.accountId ?? '';
    return this.locationsService.findOne(id, accountId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a location' })
  update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: UpdateLocationDto,
  ): Promise<LocationResponseDto> {
    const accountId = req.tenantScope?.accountId ?? '';
    return this.locationsService.update(id, accountId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a location' })
  archive(@Param('id') id: string, @Req() req: Request): Promise<LocationResponseDto> {
    const accountId = req.tenantScope?.accountId ?? '';
    return this.locationsService.archive(id, accountId);
  }
}
