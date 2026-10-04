import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Login payload.
 *
 * Khai bao property that (khong dung `declare`) de `emitDecoratorMetadata`
 * tao du `design:type` runtime — `ValidationPipe` can metadata nay de biet
 * field nao bat buoc nhap. Bat buoc khai bao `!` vi class duoc nap qua DI,
 * khong co constructor de gan gia tri.
 */
export class LoginDto {
  @ApiProperty({ example: 'khach@example.com' })
  @IsEmail({}, { message: 'Email is invalid' })
  email!: string;

  @ApiProperty({ example: 'matkhau123' })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  @MaxLength(200)
  password!: string;
}
