import { Prisma } from '../../../../generated/prisma/client';
import { authorSelect } from '../../../common/types/author.type';

export const likeUserSelect = {
  id: true,
  user: {
    select: authorSelect,
  },
  createdAt: true,
} satisfies Prisma.LikeSelect;

export type LikeUserRecord = Prisma.LikeGetPayload<{
  select: typeof likeUserSelect;
}>;

export function buildLikeCursorFilter(
  createdAt: string,
  id: string,
): Prisma.LikeWhereInput {
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
