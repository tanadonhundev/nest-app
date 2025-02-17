import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, genSalt, compare } from 'bcrypt';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    //เช็คอีเมลซ้ำ
    const user = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });
    if (user) {
      throw new BadRequestException('This email is already in the system');
    }
    // hash password
    const salt = await genSalt(10);
    const hashPassword = await hash(registerDto.password, salt);
    // เพื่ม user ใหม่ไปยัง table
    const newUser = this.usersRepository.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: hashPassword,
    });
    // บันทึก user ใหม่ลง database
    await this.usersRepository.save(newUser);
    return newUser;
  }

  //login
  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('User not found'); //401
    }
    // เปรียบเทียบรหัสผ่าน
    const isValid = await compare(loginDto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('password is incorrect'); //401
    }
    //gen jwt token
    const payload = { user_id: user.id };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECERT,
    });
    return { access_token: token };
  }
}
