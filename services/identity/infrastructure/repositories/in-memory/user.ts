import { User } from "../../../domain/entities/user";
import { IUserRepository } from "../../../domain/repositories/iuser";

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async create(user: User): Promise<User | null> {
    this.users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  deteteUsers(){
    this.users = []
  }

  async getAllUsers():Promise<User[]>{

    return this.users;
  }
}