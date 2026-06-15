
import { prisma, type User } from "@global-genius/database";
import type { CreateUserInput } from "./types/create-user.js";
import type { IRegisterRepository } from "./interfaces/iregister.js";

export class PrismaRegisterRepository implements IRegisterRepository {
  async create(user: CreateUserInput): Promise<User> {
    return await prisma.user.create({
      data: {
        email: user.email,
        password: user.password,
      },
    });
  }

}
