import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findByBakery(bakeryId: string) {
    return this.prisma.product.findMany({ where: { sellerId: bakeryId, isActive: true }, orderBy: { createdAt: 'desc' } });
  }

  async create(data: { sellerId: string; name: string; price: number; description?: string; category?: string; imageUrl?: string }) {
    return this.prisma.product.create({ data });
  }

  async update(id: string, data: any) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }
}
