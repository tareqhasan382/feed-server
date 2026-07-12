import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthorSummaryDto {
  @ApiProperty({ example: 'clxyz123abc456def789' })
  id: string;

  @ApiProperty({ example: 'Tareq' })
  firstName: string;

  @ApiProperty({ example: 'Hasan' })
  lastName: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/abc.jpg',
    nullable: true,
  })
  avatar: string | null;
}
