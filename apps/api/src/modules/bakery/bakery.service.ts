import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class BakeryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sellerProfile.findMany({
      where: { user: { isActive: true } },
      include: {
        products: { where: { isActive: true } },
        user: { select: { id: true, name: true, phone: true } },
      },
    });
  }

  async findNearby(lat: number, lng: number, radius = 10) {
    const bakeries = await this.findAll();
    return bakeries.filter(b => {
      if (b.lat == null || b.lng == null) return false;
      const dist = this.calcDistance(lat, lng, b.lat, b.lng);
      return dist <= radius;
    }).map(b => ({
      ...b,
      distance: this.calcDistance(lat, lng, b.lat!, b.lng!),
    })).sort((a, b) => a.distance - b.distance);
  }

  async findOne(id: string) {
    return this.prisma.sellerProfile.findUnique({
      where: { id },
      include: {
        products: { where: { isActive: true } },
        user: { select: { id: true, name: true, phone: true } },
        orders: {
          where: { status: { not: 'DELIVERED' } },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.sellerProfile.update({
      where: { id },
      data: {
        bakeryName: data.bakeryName,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        openTime: data.openTime,
        closeTime: data.closeTime,
        status: data.status,
      },
    });
  }

  private calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
}
