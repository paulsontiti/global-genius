export class Email {
  private constructor(public readonly value: string) {}

  static create(email: string): Email {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
      throw new Error("Invalid email format");
    }

    return new Email(email);
  }
}