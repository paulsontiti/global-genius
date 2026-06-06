import { Session } from "../entities/session";

export interface ISessionRepository {
  create(session: Session): Promise<void>;
  getSessions():Promise<Session[]>;
}