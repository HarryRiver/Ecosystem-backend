import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, Req } from '@nestjs/common';
import { VounchersService } from './vounchers.service';
import { CreateVouncherDto } from './dto/create-vouncher.dto';
import { UpdateVouncherDto } from './dto/update-vouncher.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('vounchers')
export class VounchersController {
  constructor(private readonly vounchersService: VounchersService) {}

  // ===================== CUSTOMER: VALIDATE =====================

  @Get('validate/:code')
  async validate(
    @Param('code') code: string,
    @Query('amount', ParseIntPipe) amount: number,
    @Req() req: any, // Optional: if logged in, check user limit
  ) {
    const user = req.user; // If JwtAuthGuard is not used, this might be null
    // Note: To check user limit, we might need an optional guard or handle null
    return await this.vounchersService.validateAndCalculate(code, amount, user?.id);
  }

  // ===================== ADMIN: CRUD =====================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createVouncherDto: CreateVouncherDto) {
    return this.vounchersService.create(createVouncherDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.vounchersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vounchersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateVouncherDto: UpdateVouncherDto) {
    return this.vounchersService.update(id, updateVouncherDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vounchersService.remove(id);
  }
}
