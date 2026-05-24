import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private payments: PaymentService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  pay(@Body() body: any) { return this.payments.createPayment(body.orderId, body.method, body.amount); }

  @Get(':orderId')
  status(@Param('orderId') orderId: string) { return this.payments.getPaymentStatus(orderId); }
}
