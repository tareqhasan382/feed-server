import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'clxyz123abc456def789' })
  id: string;

  @ApiProperty({ example: 'Tareq' })
  firstName: string;

  @ApiProperty({ example: 'Hasan' })
  lastName: string;

  @ApiProperty({ example: 'tareq@example.com' })
  email: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/avatars/user.png',
    nullable: true,
  })
  avatar: string | null;

  @ApiProperty({ example: '2026-07-12T08:16:13.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-12T08:16:13.000Z' })
  updatedAt: Date;
}
