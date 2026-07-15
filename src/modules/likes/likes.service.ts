import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../../common/dto/cursor-pagination-query.dto';
import { decodeCursor, encodeCursor } from '../../common/utils/cursor.util';
import { PrismaService } from '../../prisma/prisma.service';
import { CommentsService } from '../comments/comments.service';
import { PostsService } from '../posts/posts.service';
import {
  CommentLikeListResponseDto,
  LikeToggleResponseDto,
  PostLikeListResponseDto,
} from './dto/like-response.dto';
import { mapLikeUser } from './mappers/like.mapper';
import { buildLikeCursorFilter, likeUserSelect } from './types/like.types';

@Injectable()
export class LikesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  async togglePostLike(
    userId: string,
    postId: string,
  ): Promise<LikeToggleResponseDto> {
    await this.postsService.findAccessiblePost(postId, userId);

    return this.prisma.$transaction(async (tx) => {
      const existingLike = await tx.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
        select: { id: true },
      });

      if (existingLike) {
        await tx.like.delete({
          where: { id: existingLike.id },
        });
      } else {
        await tx.like.create({
          data: {
            userId,
            postId,
          },
        });
      }

      const likeCount = await tx.like.count({
        where: { postId },
      });

      return {
        liked: !existingLike,
        likeCount,
      };
    });
  }

  async toggleCommentLike(
    userId: string,
    commentId: string,
  ): Promise<LikeToggleResponseDto> {
    await this.commentsService.findAccessibleComment(commentId, userId);

    return this.prisma.$transaction(async (tx) => {
      const existingLike = await tx.like.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
        select: { id: true },
      });

      if (existingLike) {
        await tx.like.delete({
          where: { id: existingLike.id },
        });
      } else {
        await tx.like.create({
          data: {
            userId,
            commentId,
          },
        });
      }

      const likeCount = await tx.like.count({
        where: { commentId },
      });

      return {
        liked: !existingLike,
        likeCount,
      };
    });
  }

  async getPostLikes(
    userId: string,
    postId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_LIMIT,
  ): Promise<PostLikeListResponseDto> {
    await this.postsService.findAccessiblePost(postId, userId);

    const pageLimit = Math.min(Math.max(limit, 1), MAX_PAGE_LIMIT);
    const where: Prisma.LikeWhereInput = { postId };

    if (cursor) {
      const decodedCursor = decodeCursor(cursor);
      where.AND = [
        buildLikeCursorFilter(decodedCursor.createdAt, decodedCursor.id),
      ];
    }

    const likes = await this.prisma.like.findMany({
      where,
      take: pageLimit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: likeUserSelect,
    });

    const hasMore = likes.length > pageLimit;
    const items = hasMore ? likes.slice(0, pageLimit) : likes;
    const lastItem = items.at(-1);

    return {
      items: items.map(mapLikeUser),
      nextCursor:
        hasMore && lastItem
          ? encodeCursor(lastItem.createdAt, lastItem.id)
          : null,
      limit: pageLimit,
    };
  }

  async getCommentLikes(
    userId: string,
    commentId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_LIMIT,
  ): Promise<CommentLikeListResponseDto> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.postsService.findAccessiblePost(comment.postId, userId);

    const pageLimit = Math.min(Math.max(limit, 1), MAX_PAGE_LIMIT);
    const where: Prisma.LikeWhereInput = { commentId };

    if (cursor) {
      const decodedCursor = decodeCursor(cursor);
      where.AND = [
        buildLikeCursorFilter(decodedCursor.createdAt, decodedCursor.id),
      ];
    }

    const likes = await this.prisma.like.findMany({
      where,
      take: pageLimit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: likeUserSelect,
    });

    const hasMore = likes.length > pageLimit;
    const items = hasMore ? likes.slice(0, pageLimit) : likes;
    const lastItem = items.at(-1);

    return {
      items: items.map(mapLikeUser),
      nextCursor:
        hasMore && lastItem
          ? encodeCursor(lastItem.createdAt, lastItem.id)
          : null,
      limit: pageLimit,
    };
  }
}
