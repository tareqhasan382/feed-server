import { ApiProperty } from '@nestjs/swagger';

export class LikeToggleResponseDto {
  @ApiProperty({ example: true })
  liked: boolean;

  @ApiProperty({ example: 15 })
  likeCount: number;
}

export class LikeUserDto {
  @ApiProperty({ example: 'clxyz123abc456def789' })
  id: string;

  @ApiProperty({ example: 'Jane' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/v1/avatars/abc.jpg',
    nullable: true,
  })
  avatar: string | null;

  @ApiProperty({ example: '2026-07-12T10:00:00.000Z' })
  createdAt: Date;
}

export class PostLikeListResponseDto {
  @ApiProperty({ type: [LikeUserDto] })
  items: LikeUserDto[];

  @ApiProperty({
    nullable: true,
    example:
      'eyJjcmVhdGVkQXQiOiIyMDI2LTA3LTEyVDEwOjAwOjAwLjAwMFoiLCJpZCI6ImNseHl6MTIzIn0',
  })
  nextCursor: string | null;

  @ApiProperty({ example: 20 })
  limit: number;
}

export class CommentLikeListResponseDto {
  @ApiProperty({ type: [LikeUserDto] })
  items: LikeUserDto[];

  @ApiProperty({
    nullable: true,
    example:
      'eyJjcmVhdGVkQXQiOiIyMDI2LTA3LTEyVDEwOjAwOjAwLjAwMFoiLCJpZCI6ImNseHl6MTIzIn0',
  })
  nextCursor: string | null;

  @ApiProperty({ example: 20 })
  limit: number;
}
