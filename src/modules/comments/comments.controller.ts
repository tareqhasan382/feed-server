import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
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
import { CommentsService } from './comments.service';
import {
  CommentListApiResponseDto,
  CreateCommentApiResponseDto,
  CreateReplyApiResponseDto,
  ReplyListApiResponseDto,
} from './dto/comment-api-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Comments')
@ApiBearerAuth('access-token')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('posts/:postId/comments')
  @ApiOperation({ summary: 'Create a top-level comment on a post' })
  @ApiCreatedResponse({
    description: 'Comment created successfully',
    type: CreateCommentApiResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const comment = await this.commentsService.createComment(
      user.id,
      postId,
      createCommentDto,
    );

    return successResponse({ comment }, 'Comment created successfully');
  }

  @Post('comments/:commentId/replies')
  @ApiOperation({ summary: 'Reply to a top-level comment' })
  @ApiCreatedResponse({
    description: 'Reply created successfully',
    type: CreateReplyApiResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or reply-to-reply rejected',
  })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createReply(
    @CurrentUser() user: AuthenticatedUser,
    @Param('commentId') commentId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const reply = await this.commentsService.createReply(
      user.id,
      commentId,
      createCommentDto,
    );

    return successResponse({ reply }, 'Reply created successfully');
  }

  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'Get top-level comments for a post' })
  @ApiOkResponse({
    description: 'Comments retrieved successfully',
    type: CommentListApiResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid cursor or pagination params' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getPostComments(
    @CurrentUser() user: AuthenticatedUser,
    @Param('postId') postId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const comments = await this.commentsService.getPostComments(
      user.id,
      postId,
      query.cursor,
      query.limit,
    );

    return successResponse(comments, 'Comments retrieved successfully');
  }

  @Get('comments/:commentId/replies')
  @ApiOperation({ summary: 'Get direct replies for a top-level comment' })
  @ApiOkResponse({
    description: 'Replies retrieved successfully',
    type: ReplyListApiResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid cursor or pagination params' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getCommentReplies(
    @CurrentUser() user: AuthenticatedUser,
    @Param('commentId') commentId: string,
    @Query() query: CursorPaginationQueryDto,
  ) {
    const replies = await this.commentsService.getCommentReplies(
      user.id,
      commentId,
      query.cursor,
      query.limit,
    );

    return successResponse(replies, 'Replies retrieved successfully');
  }
}
