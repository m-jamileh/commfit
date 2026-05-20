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
  CreateEquipmentDto,
  EquipmentResponseDto,
  UpdateEquipmentDto,
} from '@commfit/shared-types';
import { EquipmentService } from './equipment.service';

@ApiTags('equipment')
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  @ApiOperation({ summary: 'List all equipment' })
  findAll(
    @Req() req: Request,
    @Query('locationId') locationId?: string,
  ): Promise<EquipmentResponseDto[]> {
    const accountId = req.tenantScope?.accountId ?? '';
    return this.equipmentService.findAll(accountId, locationId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create equipment' })
  create(@Body() body: CreateEquipmentDto): Promise<EquipmentResponseDto> {
    return this.equipmentService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment by ID' })
  findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<EquipmentResponseDto> {
    const accountId = req.tenantScope?.accountId ?? '';
    return this.equipmentService.findOne(id, accountId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update equipment' })
  update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: UpdateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    const accountId = req.tenantScope?.accountId ?? '';
    return this.equipmentService.update(id, accountId, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive equipment' })
  archive(@Param('id') id: string, @Req() req: Request): Promise<EquipmentResponseDto> {
    const accountId = req.tenantScope?.accountId ?? '';
    return this.equipmentService.archive(id, accountId);
  }
}
