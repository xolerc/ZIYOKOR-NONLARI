import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationController {
  constructor(private notifications: NotificationService) {}

  @Get()
  findAll(@Req() req: any) { return this.notifications.findUserNotifications(req.user.id); }

  @Patch(':id/read')
  markRead(@Param('id') id: string) { return this.notifications.markRead(id); }

  @Patch('read-all')
  markAllRead(@Req() req: any) { return this.notifications.markAllRead(req.user.id); }
}
