import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('dashboard')
  getDashboard() { return this.admin.getDashboard(); }

  @Get('users')
  getUsers() { return this.admin.getUsers(); }

  @Post('users/:id/toggle')
  toggleUser(@Param('id') id: string) { return this.admin.toggleUserStatus(id); }
}
