import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [users, bakeries, orders, revenue, activeOrders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.sellerProfile.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { total: true } }),
      this.prisma.order.count({ where: { status: { notIn: ['DELIVERED', 'REJECTED'] } } }),
    ]);
    return { users, bakeries, orders, revenue: revenue._sum.total || 0, activeOrders };
  }

  async getUsers() { return this.prisma.user.findMany({ include: { sellerProfile: true, deliveryProfile: true, customerProfile: true }, orderBy: { createdAt: 'desc' } }); }

  async toggleUserStatus(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return this.prisma.user.update({ where: { id }, data: { isActive: !user?.isActive } });
  }
}
