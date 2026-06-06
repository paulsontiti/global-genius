import { InvalidPasswordError } from "../errors/invalid-passowr";

export class Password {
  private constructor(public readonly value: string) {}

  static create(password: string): Password {

    if (password === "") {
      throw new InvalidPasswordError();
    }

    return new Password(password);
  }
}