import type { Session } from "../../../generated/prisma/client.js";
import type { CreateSession } from "../types/create-session.js";



 export interface ISessionRepository {
  create(session: CreateSession): Promise<void>;
  getSessions():Promise<Session[]>;
  findByUserId(userId:string):Promise<Session | null>;
}