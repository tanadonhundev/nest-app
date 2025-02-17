import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'ชื่อ ห้ามว่าง' })
  firstName: string;

  @IsNotEmpty({ message: 'นามสกุล ห้ามว่าง' })
  lastName: string;

  @IsNotEmpty({ message: 'อีเมล ห้ามว่าง' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email: string;

  @IsNotEmpty({ message: 'รหัสผ่าน ห้ามว่าง' })
  password: string;
}
