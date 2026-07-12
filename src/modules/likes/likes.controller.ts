import { Controller, Param, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { successResponse } from '../../common/utils/api-response.util';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { LikeToggleApiResponseDto } from './dto/like-api-response.dto';
import { LikesService } from './likes.service';

@ApiTags('Likes')
@ApiBearerAuth('access-token')
@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('posts/:id/like')
  @ApiOperation({ summary: 'Toggle like on a post' })
  @ApiOkResponse({
    description: 'Post like toggled successfully',
    type: LikeToggleApiResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async togglePostLike(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') postId: string,
  ) {
    const result = await this.likesService.togglePostLike(user.id, postId);

    return successResponse(result, 'Post like toggled successfully');
  }

  @Post('comments/:id/like')
  @ApiOperation({ summary: 'Toggle like on a comment' })
  @ApiOkResponse({
    description: 'Comment like toggled successfully',
    type: LikeToggleApiResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async toggleCommentLike(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') commentId: string,
  ) {
    const result = await this.likesService.toggleCommentLike(
      user.id,
      commentId,
    );

    return successResponse(result, 'Comment like toggled successfully');
  }
}
