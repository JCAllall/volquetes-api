import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    },
  ) {
    // Solo se toman estos campos: cualquier otro campo del body (como
    // "role") se descarta acá mismo, así nadie puede auto-asignarse un
    // rol distinto al default ('constructor') pasando datos extra.
    const { name, email, password, phone } = body;
    return this.usersService.create({ name, email, password, phone });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin')
  createAdmin(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    },
  ) {
    // Único endpoint que puede crear un usuario con role: 'admin', y
    // requiere estar autenticado como admin para usarlo.
    const { name, email, password, phone } = body;
    return this.usersService.create({
      name,
      email,
      password,
      phone,
      role: 'admin',
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
