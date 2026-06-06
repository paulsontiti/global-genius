import { Session } from "../../../domain/entities/session";
import { ISessionRepository } from "../../../domain/repositories/isession";

export class InMemorySessionRepository implements ISessionRepository {
  async create(session: Session): Promise<void> {
     this.sessions.push(session)
  }
  private sessions: Session[] = [];

  async getSessions(){
    return this.sessions
  }

}