import { User, UserRole } from "../../domain/entities/user";
import { IPasswordHasher } from "../../domain/services/ipassword-hasher";
import { IUserRepository } from "../../domain/repositories/iuser";
import { EmailAlreadyExistsError } from "../../domain/errors/email-already-exist";
import { Email } from "../../domain/value-objects/email";
import { Password } from "../../domain/value-objects/password";

export class RegisterUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private hasher: IPasswordHasher,
  ) {}

  async execute(input: { email: string; password: string; role: UserRole }) {
    const existing = await this.userRepo.findByEmail(input.email);

    if (existing) {
      throw new EmailAlreadyExistsError();
    }

    const email = Email.create(input.email).value;
    const password = Password.create(input.password).value;
    const hashedPassword = await this.hashPassword(password);
    const user = User.create({
      email,
      passwordHash: hashedPassword,
      role: input.role,
    });

    return await this.userRepo.create(user);
  }

  private async hashPassword(password: string): Promise<string> {
    return await this.hasher.hash(password);
  }
}
