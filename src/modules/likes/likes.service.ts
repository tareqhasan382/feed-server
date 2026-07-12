import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CommentsService } from '../comments/comments.service';
import { PostsService } from '../posts/posts.service';
import { LikeToggleResponseDto } from './dto/like-response.dto';

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

      const totalLikes = await tx.like.count({
        where: { postId },
      });

      return {
        liked: !existingLike,
        totalLikes,
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

      const totalLikes = await tx.like.count({
        where: { commentId },
      });

      return {
        liked: !existingLike,
        totalLikes,
      };
    });
  }
}
