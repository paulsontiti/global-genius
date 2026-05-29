import { User, UserRole } from "../../domain/entities/user";
import { IUserRepository } from "../../domain/repositories/iuser";

export class RegisterUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(input: { email: string; password: string; role: UserRole }) {
    const existing = await this.userRepo.findByEmail(input.email);

    if (existing) {
      throw new Error("User already exists");
    }

    const user = new User(
      input.email,
      this.hashPassword(input.password),
      input.role,
      new Date(),
    );

    return await this.userRepo.create(user);
  }

  private hashPassword(password: string): string {
    return `hashed_${password}`; // replace with bcrypt later
  }
}
