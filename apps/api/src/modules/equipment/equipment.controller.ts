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
import { EquipmentService } from './equipment.service';

const NOT_IMPLEMENTED = { statusCode: 501, message: 'Not implemented' };

@ApiTags('equipment')
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  @ApiOperation({ summary: 'List all equipment' })
  findAll(): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create equipment' })
  create(@Body() _body: unknown): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get equipment by ID' })
  findOne(@Param('id') _id: string): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update equipment' })
  update(@Param('id') _id: string, @Body() _body: unknown): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }
}
