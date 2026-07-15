import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CursorPaginationQueryDto } from '../../common/dto/cursor-pagination-query.dto';
import { successResponse } from '../../common/utils/api-response.util';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import {
  CommentLikeListApiResponseDto,
  LikeToggleApiResponseDto,
  PostLikeListApiResponseDto,
} from './dto/like-api-response.dto';
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

  @Get('posts/:postId/likes')
  @ApiOperation({ summary: 'Get users who liked a post' })
  @ApiOkResponse({
    description: 'Post likes retrieved successfully',
    type: PostLikeListApiResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid cursor or pagination params' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiForbiddenResponse({ description: 'Private post access denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getPostLikes(
    @CurrentUser() user: AuthenticatedUser,
    @Param('postId') postId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const likes = await this.likesService.getPostLikes(
      user.id,
      postId,
      query.cursor,
      query.limit,
    );

    return successResponse(likes, 'Post likes retrieved successfully');
  }

  @Get('comments/:commentId/likes')
  @ApiOperation({ summary: 'Get users who liked a comment' })
  @ApiOkResponse({
    description: 'Comment likes retrieved successfully',
    type: CommentLikeListApiResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid cursor or pagination params' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @ApiForbiddenResponse({ description: 'Private post access denied' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getCommentLikes(
    @CurrentUser() user: AuthenticatedUser,
    @Param('commentId') commentId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const likes = await this.likesService.getCommentLikes(
      user.id,
      commentId,
      query.cursor,
      query.limit,
    );

    return successResponse(likes, 'Comment likes retrieved successfully');
  }
}
