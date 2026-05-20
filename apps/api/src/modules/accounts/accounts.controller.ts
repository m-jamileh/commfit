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
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  AccountResponseDto,
  CreateAccountDto,
  UpdateAccountDto,
} from '@commfit/shared-types';
import { AccountsService } from './accounts.service';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'List all accounts' })
  findAll(): Promise<AccountResponseDto[]> {
    return this.accountsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an account' })
  create(@Body() body: CreateAccountDto): Promise<AccountResponseDto> {
    return this.accountsService.create(body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an account by ID' })
  findOne(@Param('id') id: string): Promise<AccountResponseDto> {
    return this.accountsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateAccountDto,
  ): Promise<AccountResponseDto> {
    return this.accountsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive an account' })
  archive(@Param('id') id: string): Promise<AccountResponseDto> {
    return this.accountsService.archive(id);
  }
}
