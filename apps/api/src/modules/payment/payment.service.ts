import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async createPayment(orderId: string, method: string, amount: number) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { paymentMethod: method as any, paymentStatus: 'PAID' },
    });
  }

  async getPaymentStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    return { status: order?.paymentStatus, method: order?.paymentMethod };
  }
}
