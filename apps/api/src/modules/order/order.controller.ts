import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private orders: OrderService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Req() req: any, @Body() body: any) {
    return this.orders.create({ ...body, customerId: req.user.id });
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Req() req: any, @Query('status') status?: string) {
    return this.orders.findAll({ userId: req.user.id, role: req.user.role, status });
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  getStats(@Req() req: any) {
    return this.orders.getStats(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.orders.findOne(id); }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.orders.updateStatus(id, body.status, body.driverId);
  }
}
