import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: string) {
    const where = role ? { role: role as any } : {};
    return this.prisma.user.findMany({
      where,
      include: { sellerProfile: true, deliveryProfile: true, customerProfile: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        sellerProfile: { include: { products: true } },
        deliveryProfile: true,
        customerProfile: true,
        addresses: true,
      },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    return user;
  }

  async updateProfile(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        avatar: data.avatar,
        ...(data.address ? { addresses: { create: data.address } } : {}),
      },
    });
  }
}
