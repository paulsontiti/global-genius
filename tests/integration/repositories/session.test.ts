import { prisma, PrismaSessionRepository } from "@global-genius/database";
import { beforeEach, describe, expect, it } from "vitest";

describe("SessionRepository", () => {
  const sessionRepository = new PrismaSessionRepository();

  beforeEach(async () => {
    await prisma.session.deleteMany();
  }, 100000);

  const session = {
    userId: "user_id",
    refreshToken: "refresh_token",
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  };

  it("should create session", async () => {
    await sessionRepository.create(session);

    const result = await prisma.session.findFirst({
      where: { userId: session.userId },
    });

    expect(result).not.toBeNull();
  });

  it("should delete session by refresh token", async () => {
    await sessionRepository.create(session);

    await sessionRepository.deleteByRefreshToken(session.refreshToken);

    const found = await prisma.session.findFirst({
      where: { refreshToken: session.refreshToken },
    });

    expect(found).toBeNull();
  });
});
