import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

   @Post()
  create(
    @Body()
    body: {
      name: string;
      cuit: string;
      email: string;
      phone: string;
      logo_url?: string;
    },
  ) {
    // Se ignoran a propósito "approved" y "commission_pct" si vienen en
    // el body: una empresa nueva siempre arranca sin aprobar y con la
    // comisión default, nunca autoaprobada por quien la crea.
    const { name, cuit, email, phone, logo_url } = body;
    return this.companiesService.create({ name, cuit, email, phone, logo_url });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get('approved')
  findApproved() {
    return this.companiesService.findApproved();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.companiesService.approve(id);
  }
}
