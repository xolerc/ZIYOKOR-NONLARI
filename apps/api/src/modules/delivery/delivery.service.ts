import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  async getAvailableOrders() {
    return this.prisma.order.findMany({ where: { status: 'READY' }, include: { items: true, customer: true, seller: { include: { user: true } } } });
  }

  async getMyDeliveries(driverId: string) {
    return this.prisma.order.findMany({ where: { driverId, status: { notIn: ['DELIVERED', 'REJECTED'] } }, include: { items: true, customer: true, seller: { include: { user: true } } } });
  }

  async claimOrder(orderId: string, driverId: string) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { driverId, status: 'DELIVERING' },
      include: { items: true, customer: true, seller: true },
    });
  }

  async getStats(driverId: string) {
    const [completed, totalRevenue] = await Promise.all([
      this.prisma.order.count({ where: { driverId, status: 'DELIVERED' } }),
      this.prisma.order.aggregate({ where: { driverId, status: 'DELIVERED' }, _sum: { total: true } }),
    ]);
    return { completed, revenue: totalRevenue._sum.total || 0 };
  }
}
