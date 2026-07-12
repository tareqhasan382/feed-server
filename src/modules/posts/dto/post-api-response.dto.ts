import { ApiProperty } from '@nestjs/swagger';
import { ApiSuccessResponseDto } from '../../../common/dto/api-response.dto';
import {
  CreatePostResponseDto,
  PostDetailDto,
  PostFeedItemDto,
  PostFeedResponseDto,
} from './post-response.dto';

export class CreatePostApiResponseDto extends ApiSuccessResponseDto<CreatePostResponseDto> {
  @ApiProperty({ type: CreatePostResponseDto })
  declare data: CreatePostResponseDto;
}

export class PostFeedApiResponseDto extends ApiSuccessResponseDto<PostFeedResponseDto> {
  @ApiProperty({ type: PostFeedResponseDto })
  declare data: PostFeedResponseDto;
}

export class PostDetailApiResponseDto extends ApiSuccessResponseDto<PostDetailDto> {
  @ApiProperty({ type: PostDetailDto })
  declare data: PostDetailDto;
}
