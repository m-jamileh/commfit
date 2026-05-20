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
  PaginatedResponseDto,
  PaginationQueryDto,
  UpdateEquipmentDto,
} from '@commfit/shared-types';
import { EquipmentService } from './equipment.service';

@ApiTags('equipment')
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  @ApiOperation({ summary: 'List all equipment (paginated)' })
  findAll(
    @Query() query: PaginationQueryDto,
    @Query('accountId') queryAccountId?: string,
    @Query('locationId') locationId?: string,
    @Query('equipmentClass') equipmentClass?: string,
    @Query('condition') condition?: string,
    @Req() req?: Request,
  ): Promise<PaginatedResponseDto<EquipmentResponseDto>> {
    const accountId =
      queryAccountId ?? (req as Request)?.tenantScope?.accountId;
    return this.equipmentService.findAll({
      ...query,
      accountId,
      locationId,
      equipmentClass,
      condition,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create equipment' })
  create(@Body() body: CreateEquipmentDto): Promise<EquipmentResponseDto> {
    return this.equipmentService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment by ID' })
  findOne(@Param('id') id: string): Promise<EquipmentResponseDto> {
    return this.equipmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update equipment' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateEquipmentDto,
  ): Promise<EquipmentResponseDto> {
    return this.equipmentService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive equipment' })
  archive(@Param('id') id: string): Promise<EquipmentResponseDto> {
    return this.equipmentService.archive(id);
  }
}
