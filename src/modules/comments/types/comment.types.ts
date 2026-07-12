import { Prisma } from '../../../../generated/prisma/client';
import { authorSelect } from '../../../common/types/author.type';

export const commentSummarySelect = (userId: string) =>
  ({
    id: true,
    content: true,
    createdAt: true,
    author: {
      select: authorSelect,
    },
    _count: {
      select: {
        likes: true,
        replies: true,
      },
    },
    likes: {
      where: { userId },
      select: { id: true },
      take: 1,
    },
  }) satisfies Prisma.CommentSelect;

export const replySummarySelect = (userId: string) =>
  ({
    id: true,
    content: true,
    createdAt: true,
    author: {
      select: authorSelect,
    },
    _count: {
      select: {
        likes: true,
      },
    },
    likes: {
      where: { userId },
      select: { id: true },
      take: 1,
    },
  }) satisfies Prisma.CommentSelect;

export type CommentSummaryRecord = Prisma.CommentGetPayload<{
  select: ReturnType<typeof commentSummarySelect>;
}>;

export type ReplySummaryRecord = Prisma.CommentGetPayload<{
  select: ReturnType<typeof replySummarySelect>;
}>;

export function buildCommentCursorFilter(
  createdAt: string,
  id: string,
): Prisma.CommentWhereInput {
  const cursorDate = new Date(createdAt);

  return {
    OR: [
      { createdAt: { lt: cursorDate } },
      {
        createdAt: cursorDate,
        id: { lt: id },
      },
    ],
  };
}
