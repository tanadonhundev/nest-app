import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, genSalt, compare } from 'bcrypt';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async generateTokens(user: User) {
    const payload = { user_id: user.id };

    // สร้าง Access Token
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m', // Access Token มีอายุ 15 นาที
    });

    // สร้าง Refresh Token
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d', // Refresh Token มีอายุ 7 วัน
    });

    // เพิ่ม Salt ในการ Hash เพื่อให้ค่าของ token แตกต่างกันทุกครั้ง
    const salt = await genSalt(10);
    const hashedRefreshToken = await hash(refreshToken, salt);

    // ตรวจสอบว่า Refresh Token ของผู้ใช้มีอยู่แล้วหรือไม่
    const existingToken = await this.refreshTokenRepository.findOne({
      where: { user },
    });
    if (existingToken) {
      // ถ้ามีอยู่แล้ว อัปเดต token ใหม่
      existingToken.token = hashedRefreshToken;
      await this.refreshTokenRepository.save(existingToken);
    } else {
      // ถ้าไม่มี ให้สร้างใหม่
      await this.refreshTokenRepository.save({
        token: hashedRefreshToken,
        user,
      });
    }

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });
    if (user) {
      throw new BadRequestException('This email is already in the system');
    }

    const salt = await genSalt(10);
    const hashPassword = await hash(registerDto.password, salt);

    const newUser = this.usersRepository.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: hashPassword,
    });

    await this.usersRepository.save(newUser);
    return newUser;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await compare(loginDto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    return this.generateTokens(user);
  }

  async logout(userId: number) {
    return this.refreshTokenRepository.update({ userId }, { token: null });
  }

  async refreshToken(refreshToken: string) {
    const tokens = await this.refreshTokenRepository.find();
    let validToken: RefreshToken | null = null;

    for (const token of tokens) {
      if (await compare(refreshToken, token.token)) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.usersRepository.findOne({
      where: { id: validToken.userId },
      // select: ['id', 'firstName', 'lastName', 'email'],
    });
    return this.generateTokens(user);
  }
}
