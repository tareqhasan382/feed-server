import { ApiProperty } from '@nestjs/swagger';

export class LikeToggleResponseDto {
  @ApiProperty({ example: true })
  liked: boolean;

  @ApiProperty({ example: 15 })
  totalLikes: number;
}
