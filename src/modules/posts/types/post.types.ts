import { Prisma, Visibility } from '../../../../generated/prisma/client';
import { authorSelect } from '../../../common/types/author.type';

export const postSummarySelect = (userId: string) =>
  ({
    id: true,
    content: true,
    imageUrl: true,
    visibility: true,
    createdAt: true,
    authorId: true,
    author: {
      select: authorSelect,
    },
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
    likes: {
      where: { userId },
      select: { id: true },
      take: 1,
    },
  }) satisfies Prisma.PostSelect;

export type RecentLikerRow = {
  postId: string;
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
};

export type PostSummaryRecord = Prisma.PostGetPayload<{
  select: ReturnType<typeof postSummarySelect>;
}>;

export function buildFeedVisibilityFilter(
  userId: string,
): Prisma.PostWhereInput {
  return {
    OR: [{ visibility: Visibility.PUBLIC }, { authorId: userId }],
  };
}

export function buildCursorFilter(
  createdAt: string,
  id: string,
): Prisma.PostWhereInput {
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
