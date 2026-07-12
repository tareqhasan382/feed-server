import { ApiProperty } from '@nestjs/swagger';
import { ApiSuccessResponseDto } from '../../../common/dto/api-response.dto';
import {
  CommentListResponseDto,
  CommentSummaryDto,
  CreateCommentResponseDto,
  CreateReplyResponseDto,
  ReplyListResponseDto,
  ReplySummaryDto,
} from './comment-response.dto';

export class CreateCommentApiResponseDto extends ApiSuccessResponseDto<CreateCommentResponseDto> {
  @ApiProperty({ type: CreateCommentResponseDto })
  declare data: CreateCommentResponseDto;
}

export class CreateReplyApiResponseDto extends ApiSuccessResponseDto<CreateReplyResponseDto> {
  @ApiProperty({ type: CreateReplyResponseDto })
  declare data: CreateReplyResponseDto;
}

export class CommentListApiResponseDto extends ApiSuccessResponseDto<CommentListResponseDto> {
  @ApiProperty({ type: CommentListResponseDto })
  declare data: CommentListResponseDto;
}

export class ReplyListApiResponseDto extends ApiSuccessResponseDto<ReplyListResponseDto> {
  @ApiProperty({ type: ReplyListResponseDto })
  declare data: ReplyListResponseDto;
}

export class CommentDetailApiResponseDto extends ApiSuccessResponseDto<CommentSummaryDto> {
  @ApiProperty({ type: CommentSummaryDto })
  declare data: CommentSummaryDto;
}

export class ReplyDetailApiResponseDto extends ApiSuccessResponseDto<ReplySummaryDto> {
  @ApiProperty({ type: ReplySummaryDto })
  declare data: ReplySummaryDto;
}
