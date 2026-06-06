import { UserCreateDTO } from "../dtos/user-create";
import { Email } from "../value-objects/email";
import { Password } from "../value-objects/password";

export class User {
  constructor(
      public email: string,
      public passwordHash: string,
      public role: UserRole,
      public createdAt: Date = new Date(),
      public readonly id: string = crypto.randomUUID(),
  ) {}

  changeEmail(email: string) {
    this.email = Email.create(email).value
  }

  static create(input:UserCreateDTO){
    
    return new User(input.email,input.passwordHash,input.role)
  }
}

export type UserRole =
  | "student"
  | "mentor"
  | "company"
  | "admin";