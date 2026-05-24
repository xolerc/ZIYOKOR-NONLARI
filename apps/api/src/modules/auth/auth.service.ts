import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async sendOtp(phone: string) {
    const code = '1234';
    return { success: true, message: 'SMS yuborildi', code };
  }

  async verifyOtp(phone: string, code: string) {
    if (code !== '1234') throw new UnauthorizedException('Kod noto\'g\'ri');
    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { phone, name: 'Foydalanuvchi', role: 'CUSTOMER' },
      });
    }
    const token = this.jwt.sign({ id: user.id, phone: user.phone, role: user.role });
    return { token, user };
  }

  async register(data: { phone: string; name: string; role: string; bakeryName?: string; vehicleType?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) throw new UnauthorizedException('Bu raqam avval ro\'yxatdan o\'tgan');

    const user = await this.prisma.user.create({
      data: {
        phone: data.phone,
        name: data.name,
        role: data.role as any,
        ...(data.role === 'SELLER' ? {
          sellerProfile: { create: { bakeryName: data.bakeryName || '' } }
        } : {}),
        ...(data.role === 'DELIVERY' ? {
          deliveryProfile: { create: { vehicleType: data.vehicleType } }
        } : {}),
        ...(data.role === 'CUSTOMER' ? {
          customerProfile: { create: {} }
        } : {}),
      },
      include: {
        sellerProfile: true,
        deliveryProfile: true,
        customerProfile: true,
      },
    });

    const token = this.jwt.sign({ id: user.id, phone: user.phone, role: user.role });
    return { token, user };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        sellerProfile: { include: { products: true } },
        deliveryProfile: true,
        customerProfile: true,
        addresses: true,
      },
    });
  }
}
