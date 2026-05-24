import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
  ) {}

  async create(data: {
    customerId: string; sellerId: string; items: { productId?: string; name: string; price: number; quantity: number }[];
    total: number; address: string; lat?: number; lng?: number; paymentMethod?: string;
  }) {
    const order = await this.prisma.order.create({
      data: {
        customerId: data.customerId,
        sellerId: data.sellerId,
        total: data.total,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        paymentMethod: (data.paymentMethod as any) || 'CASH',
        items: { create: data.items },
      },
      include: { items: true, customer: true, seller: { include: { user: true } } },
    });
    if (order.seller) {
      await this.notifications.create(order.seller.userId, 'Yangi buyurtma', `#${order.id.slice(-5)} yangi buyurtma`);
    }
    return order;
  }

  async findAll(params: { userId?: string; role?: string; status?: string }) {
    const where: any = {};
    if (params.userId && params.role === 'CUSTOMER') where.customerId = params.userId;
    if (params.userId && params.role === 'SELLER') where.sellerId = params.userId;
    if (params.userId && params.role === 'DELIVERY') where.driverId = params.userId;
    if (params.status) where.status = params.status;
    return this.prisma.order.findMany({
      where,
      include: { items: true, customer: true, seller: { include: { user: true } }, driver: true, review: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, customer: true, seller: { include: { user: true } }, driver: true, review: true },
    });
    if (!order) throw new NotFoundException('Buyurtma topilmadi');
    return order;
  }

  async updateStatus(id: string, status: string, driverId?: string) {
    const data: any = { status };
    if (driverId && status === 'DELIVERING') data.driverId = driverId;
    if (status === 'DELIVERED') data.deliveredAt = new Date();
    return this.prisma.order.update({ where: { id }, data, include: { items: true, customer: true, seller: { include: { user: true } }, driver: true } });
  }

  async getStats(sellerId: string) {
    const [totalOrders, activeOrders, revenue] = await Promise.all([
      this.prisma.order.count({ where: { sellerId } }),
      this.prisma.order.count({ where: { sellerId, status: { notIn: ['DELIVERED', 'REJECTED'] } } }),
      this.prisma.order.aggregate({ where: { sellerId, status: 'DELIVERED' }, _sum: { total: true } }),
    ]);
    return { totalOrders, activeOrders, revenue: revenue._sum.total || 0 };
  }
}
