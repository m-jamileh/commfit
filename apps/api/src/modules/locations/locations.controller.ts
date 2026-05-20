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
import { LocationsService } from './locations.service';

const NOT_IMPLEMENTED = { statusCode: 501, message: 'Not implemented' };

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all locations' })
  findAll(): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a location' })
  create(@Body() _body: unknown): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by ID' })
  findOne(@Param('id') _id: string): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a location' })
  update(@Param('id') _id: string, @Body() _body: unknown): typeof NOT_IMPLEMENTED {
    return NOT_IMPLEMENTED;
  }
}
