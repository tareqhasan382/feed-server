import { ApiProperty } from '@nestjs/swagger';
import { ApiSuccessResponseDto } from '../../../common/dto/api-response.dto';
import {
  CommentLikeListResponseDto,
  LikeToggleResponseDto,
  PostLikeListResponseDto,
} from './like-response.dto';

export class LikeToggleApiResponseDto extends ApiSuccessResponseDto<LikeToggleResponseDto> {
  @ApiProperty({ type: LikeToggleResponseDto })
  declare data: LikeToggleResponseDto;
}

export class PostLikeListApiResponseDto extends ApiSuccessResponseDto<PostLikeListResponseDto> {
  @ApiProperty({ type: PostLikeListResponseDto })
  declare data: PostLikeListResponseDto;
}

export class CommentLikeListApiResponseDto extends ApiSuccessResponseDto<CommentLikeListResponseDto> {
  @ApiProperty({ type: CommentLikeListResponseDto })
  declare data: CommentLikeListResponseDto;
}
