import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../../common/dto/cursor-pagination-query.dto';
import { decodeCursor, encodeCursor } from '../../common/utils/cursor.util';
import { PrismaService } from '../../prisma/prisma.service';
import { PostsService } from '../posts/posts.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  CommentSummaryDto,
  ReplySummaryDto,
} from './dto/comment-response.dto';
import { mapCommentSummary, mapReplySummary } from './mappers/comment.mapper';
import {
  buildCommentCursorFilter,
  commentSummarySelect,
  replySummarySelect,
} from './types/comment.types';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
  ) {}

  async createComment(
    userId: string,
    postId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentSummaryDto> {
    await this.postsService.findAccessiblePost(postId, userId);

    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content.trim(),
        authorId: userId,
        postId,
      },
      select: commentSummarySelect(userId),
    });

    return mapCommentSummary(comment);
  }

  async createReply(
    userId: string,
    commentId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<ReplySummaryDto> {
    const parentComment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        postId: true,
        parentId: true,
      },
    });

    if (!parentComment) {
      throw new NotFoundException('Comment not found');
    }

    if (parentComment.parentId) {
      throw new BadRequestException('Cannot reply to a reply');
    }

    await this.postsService.findAccessiblePost(parentComment.postId, userId);

    const reply = await this.prisma.comment.create({
      data: {
        content: createCommentDto.content.trim(),
        authorId: userId,
        postId: parentComment.postId,
        parentId: parentComment.id,
      },
      select: replySummarySelect(userId),
    });

    return mapReplySummary(reply);
  }

  async getPostComments(
    userId: string,
    postId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_LIMIT,
  ): Promise<{
    items: CommentSummaryDto[];
    nextCursor: string | null;
    limit: number;
  }> {
    await this.postsService.findAccessiblePost(postId, userId);

    const pageLimit = Math.min(Math.max(limit, 1), MAX_PAGE_LIMIT);
    const where: Prisma.CommentWhereInput = {
      postId,
      parentId: null,
    };

    if (cursor) {
      const decodedCursor = decodeCursor(cursor);
      where.AND = [
        buildCommentCursorFilter(decodedCursor.createdAt, decodedCursor.id),
      ];
    }

    const comments = await this.prisma.comment.findMany({
      where,
      take: pageLimit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: commentSummarySelect(userId),
    });

    const hasMore = comments.length > pageLimit;
    const items = hasMore ? comments.slice(0, pageLimit) : comments;
    const lastItem = items.at(-1);

    return {
      items: items.map(mapCommentSummary),
      nextCursor:
        hasMore && lastItem
          ? encodeCursor(lastItem.createdAt, lastItem.id)
          : null,
      limit: pageLimit,
    };
  }

  async getCommentReplies(
    userId: string,
    commentId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_LIMIT,
  ): Promise<{
    items: ReplySummaryDto[];
    nextCursor: string | null;
    limit: number;
  }> {
    const parentComment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        postId: true,
        parentId: true,
      },
    });

    if (!parentComment) {
      throw new NotFoundException('Comment not found');
    }

    if (parentComment.parentId) {
      throw new BadRequestException('Replies can only be fetched for top-level comments');
    }

    await this.postsService.findAccessiblePost(parentComment.postId, userId);

    const pageLimit = Math.min(Math.max(limit, 1), MAX_PAGE_LIMIT);
    const where: Prisma.CommentWhereInput = {
      parentId: commentId,
    };

    if (cursor) {
      const decodedCursor = decodeCursor(cursor);
      where.AND = [
        buildCommentCursorFilter(decodedCursor.createdAt, decodedCursor.id),
      ];
    }

    const replies = await this.prisma.comment.findMany({
      where,
      take: pageLimit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: replySummarySelect(userId),
    });

    const hasMore = replies.length > pageLimit;
    const items = hasMore ? replies.slice(0, pageLimit) : replies;
    const lastItem = items.at(-1);

    return {
      items: items.map(mapReplySummary),
      nextCursor:
        hasMore && lastItem
          ? encodeCursor(lastItem.createdAt, lastItem.id)
          : null,
      limit: pageLimit,
    };
  }

  async findAccessibleComment(
    commentId: string,
    userId: string,
  ): Promise<{ id: string; postId: string }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        postId: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.postsService.findAccessiblePost(comment.postId, userId);

    return comment;
  }
}
