import { ApiProperty } from '@nestjs/swagger';
import { ApiSuccessResponseDto } from '../../../common/dto/api-response.dto';
import { LikeToggleResponseDto } from './like-response.dto';

export class LikeToggleApiResponseDto extends ApiSuccessResponseDto<LikeToggleResponseDto> {
  @ApiProperty({ type: LikeToggleResponseDto })
  declare data: LikeToggleResponseDto;
}
