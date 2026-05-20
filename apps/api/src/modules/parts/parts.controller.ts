import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  CreatePartDto,
  PaginatedResponseDto,
  PaginationQueryDto,
  PartInventoryResponseDto,
  PartResponseDto,
  UpdatePartDto,
} from '@commfit/shared-types';
import { PartsService } from './parts.service';

class UpdateInventoryDto {
  locationId?: string;
  technicianId?: string;
  quantity!: number;
  reorderThreshold?: number;
}

@ApiTags('parts')
@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Get()
  @ApiOperation({ summary: 'List all parts (paginated)' })
  findAll(
    @Query() query: PaginationQueryDto,
    @Query('status') status?: string,
  ): Promise<PaginatedResponseDto<PartResponseDto>> {
    return this.partsService.findAll({ ...query, status });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a part' })
  create(@Body() body: CreatePartDto): Promise<PartResponseDto> {
    return this.partsService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a part by ID' })
  findOne(@Param('id') id: string): Promise<PartResponseDto> {
    return this.partsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a part' })
  update(@Param('id') id: string, @Body() body: UpdatePartDto): Promise<PartResponseDto> {
    return this.partsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive a part' })
  archive(@Param('id') id: string): Promise<PartResponseDto> {
    return this.partsService.archive(id);
  }

  @Get(':id/inventory')
  @ApiOperation({ summary: 'Get inventory for a part' })
  getInventory(
    @Param('id') id: string,
    @Query('locationId') locationId?: string,
    @Query('technicianId') technicianId?: string,
  ): Promise<PartInventoryResponseDto[]> {
    return this.partsService.getInventory(id, locationId, technicianId);
  }

  @Put(':id/inventory')
  @ApiOperation({ summary: 'Upsert inventory for a part' })
  updateInventory(
    @Param('id') id: string,
    @Body() body: UpdateInventoryDto,
  ): Promise<PartInventoryResponseDto> {
    return this.partsService.updateInventory(
      id,
      body.locationId,
      body.technicianId,
      body.quantity,
      body.reorderThreshold,
    );
  }
}
