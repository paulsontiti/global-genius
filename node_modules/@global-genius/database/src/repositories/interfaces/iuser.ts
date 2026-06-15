import type { User } from "../../../generated/prisma/client.js";


export interface IUserRepository {

  findById(id: string): Promise<User | null>;

  update(id:string,data: any): Promise<User>;

  delete(id: string): Promise<User>;
}