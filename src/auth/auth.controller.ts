import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
  // localhost:4000/api/v1/auth/refresh
  @Post('refresh')
  @HttpCode(201)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
