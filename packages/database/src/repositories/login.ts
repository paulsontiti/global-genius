
import { prisma, type ILoginRepository, type User } from "@global-genius/database";

export class PrismaLoginRepository implements ILoginRepository {

  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

}
