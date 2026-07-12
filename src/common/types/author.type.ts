import { Prisma } from '../../../generated/prisma/client';

export const authorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatar: true,
} satisfies Prisma.UserSelect;

export type AuthorSummary = Prisma.UserGetPayload<{
  select: typeof authorSelect;
}>;
