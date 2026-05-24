import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private chat: ChatService) {}

  @Get('rooms')
  getRooms(@Req() req: any) { return this.chat.getRooms(req.user.id); }

  @Get('messages/:roomId')
  getMessages(@Param('roomId') roomId: string) { return this.chat.getMessages(roomId); }

  @Post('send')
  send(@Req() req: any, @Body() body: any) { return this.chat.sendMessage({ ...body, senderId: req.user.id }); }
}
