export class User {
  constructor(
      public email: string,
      public passwordHash: string,
      public role: UserRole,
      public createdAt: Date,
      public readonly id?: string,
  ) {}

  changeEmail(email: string) {
    this.email = email;
  }
}

export type UserRole =
  | "student"
  | "mentor"
  | "company"
  | "admin";