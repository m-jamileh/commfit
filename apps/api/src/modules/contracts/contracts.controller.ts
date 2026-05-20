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
import { CreateContractDto, UpdateContractDto, ContractResponseDto } from '@commfit/shared-types';
import { ContractsService } from './contracts.service';

@ApiTags('contracts')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @ApiOperation({ summary: 'List all contracts' })
  findAll(
    @Query('accountId') accountId?: string,
    @Query('status') status?: string,
    @Query('serviceType') serviceType?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ): Promise<ContractResponseDto[]> {
    return this.contractsService.findAll({
      accountId,
      status,
      serviceType,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a contract' })
  create(@Body() body: CreateContractDto): Promise<ContractResponseDto> {
    return this.contractsService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contract by ID' })
  findOne(@Param('id') id: string): Promise<ContractResponseDto> {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contract' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateContractDto,
  ): Promise<ContractResponseDto> {
    return this.contractsService.update(id, body);
  }

  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a contract for signing' })
  send(
    @Param('id') id: string,
    @Body() body: { signerEmail: string; signerName: string },
  ): Promise<ContractResponseDto> {
    return this.contractsService.send(id, body);
  }

  @Post(':id/sign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a contract as signed' })
  sign(@Param('id') id: string): Promise<ContractResponseDto> {
    return this.contractsService.sign(id);
  }

  @Post(':id/terminate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminate a contract' })
  terminate(@Param('id') id: string): Promise<ContractResponseDto> {
    return this.contractsService.terminate(id);
  }

  @Post(':id/properties')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a property to a contract' })
  addProperty(
    @Param('id') id: string,
    @Body() body: { locationId: string },
  ): Promise<ContractResponseDto> {
    return this.contractsService.addProperty(id, body.locationId);
  }

  @Delete(':id/properties/:locationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a property from a contract' })
  removeProperty(
    @Param('id') id: string,
    @Param('locationId') locationId: string,
  ): Promise<ContractResponseDto> {
    return this.contractsService.removeProperty(id, locationId);
  }
}
