import { Prisma } from '@prisma/client';

export type UserWithLanguage = Prisma.UserGetPayload<{
  include: {
    language: true;
  };
}>;

export type UserWithSolves = Prisma.UserGetPayload<{
  include: {
    solves: {
      include: {
        challenge: {
          include: {
            category: true;
          };
        };
      };
    };
    language: true;
  };
}>; 