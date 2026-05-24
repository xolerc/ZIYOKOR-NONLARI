import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getMessages(roomId: string) {
    return this.prisma.chatMessage.findMany({ where: { roomId }, orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, role: true } } } });
  }

  async sendMessage(data: { senderId: string; roomId: string; content?: string; type?: string; fileUrl?: string }) {
    return this.prisma.chatMessage.create({ data, include: { sender: { select: { id: true, name: true, role: true } } } });
  }

  async getRooms(userId: string) {
    const messages = await this.prisma.chatMessage.findMany({
      where: { roomId: { contains: userId } },
      orderBy: { createdAt: 'desc' },
      distinct: ['roomId'],
      include: { sender: { select: { id: true, name: true } } },
    });
    return messages.map(m => ({ roomId: m.roomId, lastMessage: m, sender: m.sender }));
  }
}
