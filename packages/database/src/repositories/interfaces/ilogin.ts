import type { User } from "../../../generated/prisma/client.js";


export interface ILoginRepository {

  findByEmail(email: string): Promise<User | null>;
}