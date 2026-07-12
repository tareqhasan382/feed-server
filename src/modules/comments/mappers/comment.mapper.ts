import {
  CommentSummaryDto,
  ReplySummaryDto,
} from '../dto/comment-response.dto';
import {
  CommentSummaryRecord,
  ReplySummaryRecord,
} from '../types/comment.types';

export function mapCommentSummary(
  comment: CommentSummaryRecord,
): CommentSummaryDto {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: comment.author,
    likeCount: comment._count.likes,
    replyCount: comment._count.replies,
    isLiked: comment.likes.length > 0,
  };
}

export function mapReplySummary(reply: ReplySummaryRecord): ReplySummaryDto {
  return {
    id: reply.id,
    content: reply.content,
    createdAt: reply.createdAt,
    author: reply.author,
    likeCount: reply._count.likes,
    isLiked: reply.likes.length > 0,
  };
}
