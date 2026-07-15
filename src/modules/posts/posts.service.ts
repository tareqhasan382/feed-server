import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Visibility } from '../../../generated/prisma/client';
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '../../common/dto/cursor-pagination-query.dto';
import { decodeCursor, encodeCursor } from '../../common/utils/cursor.util';
import { PrismaService } from '../../prisma/prisma.service';
import { UPLOAD_FOLDERS } from '../uploads/constants/upload.constants';
import { UploadsService } from '../uploads/uploads.service';
import type { AuthorSummary } from '../../common/types/author.type';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostDetailDto, PostFeedItemDto } from './dto/post-response.dto';
import { mapPostDetail, mapPostFeedItem } from './mappers/post.mapper';
import {
  buildCursorFilter,
  buildFeedVisibilityFilter,
  postSummarySelect,
  type RecentLikerRow,
} from './types/post.types';

const RECENT_LIKERS_PER_POST = 3;

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

  async createPost(
    userId: string,
    createPostDto: CreatePostDto,
    file?: Express.Multer.File,
  ): Promise<PostDetailDto> {
    let imageUrl: string | null = null;
    let imagePublicId: string | null = null;

    if (file) {
      const upload = await this.uploadsService.uploadImage(
        file,
        UPLOAD_FOLDERS.POSTS,
      );
      imageUrl = upload.secure_url;
      imagePublicId = upload.public_id;
    }

    try {
      const post = await this.prisma.post.create({
        data: {
          content: createPostDto.content.trim(),
          visibility: createPostDto.visibility,
          authorId: userId,
          imageUrl,
          imagePublicId,
        },
        select: postSummarySelect(userId),
      });

      return mapPostDetail(post);
    } catch (error) {
      if (imagePublicId) {
        await this.uploadsService.deleteImage(imagePublicId).catch(() => undefined);
      }

      throw error;
    }
  }

  async getFeed(
    userId: string,
    cursor?: string,
    limit = DEFAULT_PAGE_LIMIT,
  ): Promise<{
    items: PostFeedItemDto[];
    nextCursor: string | null;
    limit: number;
  }> {
    const pageLimit = Math.min(Math.max(limit, 1), MAX_PAGE_LIMIT);
    const where: Prisma.PostWhereInput = buildFeedVisibilityFilter(userId);

    if (cursor) {
      const decodedCursor = decodeCursor(cursor);
      where.AND = [buildCursorFilter(decodedCursor.createdAt, decodedCursor.id)];
    }

    const posts = await this.prisma.post.findMany({
      where,
      take: pageLimit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: postSummarySelect(userId),
    });

    const hasMore = posts.length > pageLimit;
    const items = hasMore ? posts.slice(0, pageLimit) : posts;
    const lastItem = items.at(-1);
    const recentLikersByPostId = await this.fetchRecentLikersByPostIds(
      items.map((post) => post.id),
    );

    return {
      items: items.map((post) =>
        mapPostFeedItem(post, recentLikersByPostId.get(post.id) ?? []),
      ),
      nextCursor:
        hasMore && lastItem
          ? encodeCursor(lastItem.createdAt, lastItem.id)
          : null,
      limit: pageLimit,
    };
  }

  private async fetchRecentLikersByPostIds(
    postIds: string[],
  ): Promise<Map<string, AuthorSummary[]>> {
    if (postIds.length === 0) {
      return new Map();
    }

    const rows = await this.prisma.$queryRaw<RecentLikerRow[]>`
      SELECT
        ranked."postId",
        u.id,
        u."firstName",
        u."lastName",
        u.avatar
      FROM (
        SELECT
          l."postId",
          l."userId",
          ROW_NUMBER() OVER (
            PARTITION BY l."postId"
            ORDER BY l."createdAt" DESC
          ) AS rn
        FROM likes l
        WHERE l."postId" IN (${Prisma.join(postIds)})
      ) ranked
      INNER JOIN users u ON u.id = ranked."userId"
      WHERE ranked.rn <= ${RECENT_LIKERS_PER_POST}
      ORDER BY ranked."postId", ranked.rn
    `;

    const recentLikersByPostId = new Map<string, AuthorSummary[]>();

    for (const row of rows) {
      const likers = recentLikersByPostId.get(row.postId) ?? [];
      likers.push({
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        avatar: row.avatar,
      });
      recentLikersByPostId.set(row.postId, likers);
    }

    return recentLikersByPostId;
  }

  async getPostById(userId: string, postId: string): Promise<PostDetailDto> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: postSummarySelect(userId),
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    this.assertPostAccessible(post.authorId, post.visibility, userId);

    return mapPostDetail(post);
  }

  async findAccessiblePost(
    postId: string,
    userId: string,
  ): Promise<{ id: string; authorId: string; visibility: Visibility }> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        visibility: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    this.assertPostAccessible(post.authorId, post.visibility, userId);

    return post;
  }

  private assertPostAccessible(
    authorId: string,
    visibility: Visibility,
    userId: string,
  ): void {
    if (visibility === Visibility.PRIVATE && authorId !== userId) {
      throw new ForbiddenException('You do not have access to this post');
    }
  }

  private assertOwnership(authorId: string, userId: string): void {
    if (authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }
  }

  async updatePost(
    userId: string,
    postId: string,
    updatePostDto: UpdatePostDto,
    file?: Express.Multer.File,
  ): Promise<PostDetailDto> {
    const existing = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, imagePublicId: true },
    });

    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    this.assertOwnership(existing.authorId, userId);

    let newImageUrl: string | null = null;
    let newImagePublicId: string | null = null;
    let replaceImage = false;

    if (file) {
      if (existing.imagePublicId) {
        await this.uploadsService
          .deleteImage(existing.imagePublicId)
          .catch(() => undefined);
      }
      const upload = await this.uploadsService.uploadImage(
        file,
        UPLOAD_FOLDERS.POSTS,
      );
      newImageUrl = upload.secure_url;
      newImagePublicId = upload.public_id;
      replaceImage = true;
    }

    const data: Prisma.PostUpdateInput = {};

    if (updatePostDto.content !== undefined) {
      data.content = updatePostDto.content.trim();
    }
    if (updatePostDto.visibility !== undefined) {
      data.visibility = updatePostDto.visibility;
    }
    if (replaceImage) {
      data.imageUrl = newImageUrl;
      data.imagePublicId = newImagePublicId;
    }

    const post = await this.prisma.post.update({
      where: { id: postId },
      data,
      select: postSummarySelect(userId),
    });

    return mapPostDetail(post);
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const existing = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, imagePublicId: true },
    });

    if (!existing) {
      throw new NotFoundException('Post not found');
    }

    this.assertOwnership(existing.authorId, userId);

    if (existing.imagePublicId) {
      await this.uploadsService
        .deleteImage(existing.imagePublicId)
        .catch(() => undefined);
    }

    await this.prisma.post.delete({ where: { id: postId } });
  }
}
