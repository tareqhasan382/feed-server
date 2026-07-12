import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'tareq@example.com',
    description: 'Registered email address',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'StrongPassword123',
    description: 'Account password',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}
