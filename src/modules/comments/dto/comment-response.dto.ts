import { ApiProperty } from '@nestjs/swagger';
import { AuthorSummaryDto } from '../../posts/dto/author-summary.dto';

export class CommentSummaryDto {
  @ApiProperty({ example: 'clxyz123abc456def789' })
  id: string;

  @ApiProperty({ example: 'Great post!' })
  content: string;

  @ApiProperty({ example: '2026-07-12T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: AuthorSummaryDto })
  author: AuthorSummaryDto;

  @ApiProperty({ example: 5 })
  likeCount: number;

  @ApiProperty({ example: 2 })
  replyCount: number;

  @ApiProperty({ example: false })
  isLiked: boolean;
}

export class ReplySummaryDto {
  @ApiProperty({ example: 'clxyz123abc456def789' })
  id: string;

  @ApiProperty({ example: 'Thanks!' })
  content: string;

  @ApiProperty({ example: '2026-07-12T10:05:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: AuthorSummaryDto })
  author: AuthorSummaryDto;

  @ApiProperty({ example: 1 })
  likeCount: number;

  @ApiProperty({ example: true })
  isLiked: boolean;
}

export class CreateCommentResponseDto {
  @ApiProperty({ type: CommentSummaryDto })
  comment: CommentSummaryDto;
}

export class CreateReplyResponseDto {
  @ApiProperty({ type: ReplySummaryDto })
  reply: ReplySummaryDto;
}

export class CommentListResponseDto {
  @ApiProperty({ type: [CommentSummaryDto] })
  items: CommentSummaryDto[];

  @ApiProperty({
    nullable: true,
    example: 'eyJjcmVhdGVkQXQiOiIyMDI2LTA3LTEyVDEwOjAwOjAwLjAwMFoiLCJpZCI6ImNseHl6MTIzIn0',
  })
  nextCursor: string | null;

  @ApiProperty({ example: 20 })
  limit: number;
}

export class ReplyListResponseDto {
  @ApiProperty({ type: [ReplySummaryDto] })
  items: ReplySummaryDto[];

  @ApiProperty({
    nullable: true,
    example: 'eyJjcmVhdGVkQXQiOiIyMDI2LTA3LTEyVDEwOjAwOjAwLjAwMFoiLCJpZCI6ImNseHl6MTIzIn0',
  })
  nextCursor: string | null;

  @ApiProperty({ example: 20 })
  limit: number;
}
