import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DeliveryService } from './delivery.service';

@Controller('delivery')
@UseGuards(AuthGuard('jwt'))
export class DeliveryController {
  constructor(private delivery: DeliveryService) {}

  @Get('available')
  getAvailable() { return this.delivery.getAvailableOrders(); }

  @Get('my')
  getMy(@Req() req: any) { return this.delivery.getMyDeliveries(req.user.id); }

  @Post('claim/:orderId')
  claim(@Param('orderId') orderId: string, @Req() req: any) { return this.delivery.claimOrder(orderId, req.user.id); }

  @Get('stats')
  getStats(@Req() req: any) { return this.delivery.getStats(req.user.id); }
}
