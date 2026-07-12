import { Prisma } from '../../../../generated/prisma/client';

export const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{
  select: typeof safeUserSelect;
}>;
