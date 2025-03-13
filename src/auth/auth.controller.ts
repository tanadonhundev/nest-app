import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RefreshTokenGuard } from './refreshToken.guard';

@Controller({ path: 'auth', version: '1' }) // localhost:4000/api/v1/auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  // localhost:4000/api/v1/auth/register
  @Post('register')
  @HttpCode(201)
  async register(@Body() registerDto: RegisterDto) {
    await this.authService.register(registerDto);
    return {
      message: 'Successfully registered',
    };
  }
  // localhost:4000/api/v1/auth/login
  @Post('login')
  @HttpCode(201)
  async login(@Body() loginDto: LoginDto) {
    await this.authService.login(loginDto);
    return await this.authService.login(loginDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout(@Req() req: Request) {
    this.authService.logout(req.user['user_id']);
  }
  // localhost:4000/api/v1/auth/refresh
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshToken(refreshToken);
  }
}
