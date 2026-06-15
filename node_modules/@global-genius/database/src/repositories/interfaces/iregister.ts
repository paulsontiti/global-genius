import type { User } from "../../../generated/prisma/client.js";
import type { CreateUserInput } from "../types/create-user.js";


export interface IRegisterRepository {
  create(user: CreateUserInput): Promise<User>;
}