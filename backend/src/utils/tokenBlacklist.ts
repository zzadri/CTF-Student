import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class TokenBlacklist {
  private static instance: TokenBlacklist;
  private blacklistedUsers: Set<string>;

  private constructor() {
    this.blacklistedUsers = new Set();
  }

  public static getInstance(): TokenBlacklist {
    if (!TokenBlacklist.instance) {
      TokenBlacklist.instance = new TokenBlacklist();
    }
    return TokenBlacklist.instance;
  }

  public async initialize() {
    // Charger tous les utilisateurs bloqués au démarrage
    const blockedUsers = await prisma.user.findMany({
      where: { isBlocked: true },
      select: { id: true }
    });
    blockedUsers.forEach(user => this.blacklistedUsers.add(user.id));
  }

  public addToBlacklist(userId: string): void {
    this.blacklistedUsers.add(userId);
  }

  public removeFromBlacklist(userId: string): void {
    this.blacklistedUsers.delete(userId);
  }

  public isBlacklisted(userId: string): boolean {
    return this.blacklistedUsers.has(userId);
  }
}

export const tokenBlacklist = TokenBlacklist.getInstance(); 