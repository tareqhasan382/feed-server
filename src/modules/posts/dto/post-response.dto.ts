import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Visibility } from '../../../../generated/prisma/client';
import { AuthorSummaryDto } from './author-summary.dto';

export class PostSummaryDto {
  @ApiProperty({ example: 'clxyz123abc456def789' })
  id: string;

  @ApiProperty({ example: 'Hello from my first post!' })
  content: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/v1/posts/abc.jpg',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({ enum: Visibility, example: Visibility.PUBLIC })
  visibility: Visibility;

  @ApiProperty({ example: '2026-07-12T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: AuthorSummaryDto })
  author: AuthorSummaryDto;

  @ApiProperty({ example: 12 })
  likeCount: number;

  @ApiProperty({ example: 4 })
  commentCount: number;

  @ApiProperty({ example: true })
  isLiked: boolean;
}

export class PostDetailDto extends PostSummaryDto {}

export class PostFeedItemDto extends PostSummaryDto {
  @ApiProperty({
    type: [AuthorSummaryDto],
    description: 'Up to 3 most recent users who liked this post',
  })
  recentLikers: AuthorSummaryDto[];
}

export class CreatePostResponseDto {
  @ApiProperty({ type: PostDetailDto })
  post: PostDetailDto;
}

export class PostFeedResponseDto {
  @ApiProperty({ type: [PostFeedItemDto] })
  items: PostFeedItemDto[];

  @ApiProperty({
    nullable: true,
    example: 'eyJjcmVhdGVkQXQiOiIyMDI2LTA3LTEyVDEwOjAwOjAwLjAwMFoiLCJpZCI6ImNseHl6MTIzIn0',
  })
  nextCursor: string | null;

  @ApiProperty({ example: 20 })
  limit: number;
}
