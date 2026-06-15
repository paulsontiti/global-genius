import type { Session } from "../../generated/prisma/client.js";
import { prisma } from "../client.js";
import type { ISessionRepository } from "./interfaces/isession.js";
import type { CreateSession } from "./types/create-session.js";


export class PrismaSessionRepository implements ISessionRepository {
  async findByUserId(userId: string): Promise<Session | null> {
    return await prisma.session.findFirst({
      where:{userId}
    })
  }
  async getSessions(): Promise<Session[]> {
      return await prisma.session.findMany();
  }
  async create(session: CreateSession) {
    await prisma.session.create({
      data: session
    });
  }


  async deleteByRefreshToken(token: string) {
    await prisma.session.deleteMany({
      where: { refreshToken: token }
    });
  }
}