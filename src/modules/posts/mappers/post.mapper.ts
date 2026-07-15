import type { AuthorSummary } from '../../../common/types/author.type';
import { PostDetailDto, PostFeedItemDto, PostSummaryDto } from '../dto/post-response.dto';
import { PostSummaryRecord } from '../types/post.types';

export function mapPostSummary(post: PostSummaryRecord): PostSummaryDto {
  return {
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    visibility: post.visibility,
    createdAt: post.createdAt,
    authorId: post.authorId,
    author: post.author,
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    isLiked: post.likes.length > 0,
  };
}

export function mapPostFeedItem(
  post: PostSummaryRecord,
  recentLikers: AuthorSummary[] = [],
): PostFeedItemDto {
  return {
    ...mapPostSummary(post),
    recentLikers,
  };
}

export function mapPostDetail(post: PostSummaryRecord): PostDetailDto {
  return mapPostSummary(post);
}
