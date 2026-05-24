import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('send-otp')
  sendOtp(@Body('phone') phone: string) {
    return this.auth.sendOtp(phone);
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: { phone: string; code: string }) {
    return this.auth.verifyOtp(body.phone, body.code);
  }

  @Post('register')
  register(@Body() body: { phone: string; name: string; role: string; bakeryName?: string; vehicleType?: string }) {
    return this.auth.register(body);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: any) {
    return this.auth.me(req.user.id);
  }
}
