
import { prisma, type User } from "@global-genius/database";
import type { IUserRepository } from "./interfaces/iuser.js";

export class PrismaUserRepository implements IUserRepository {

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any): Promise<User> {
    return await prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return await prisma.user.delete({
      where: {
        id,
      },
    });
  }
}
