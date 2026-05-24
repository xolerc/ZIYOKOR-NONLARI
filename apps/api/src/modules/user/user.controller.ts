import { Controller, Get, Put, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private users: UserService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Query('role') role?: string) {
    return this.users.findAll(role);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  updateProfile(@Req() req: any, @Body() body: any) {
    return this.users.updateProfile(req.user.id, body);
  }
}
