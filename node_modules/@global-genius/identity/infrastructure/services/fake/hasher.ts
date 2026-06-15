import { IPasswordHasher } from "../../../domain/services/ipassword-hasher";

export class FakePasswordHasher
  implements IPasswordHasher
{
  async hash(password: string): Promise<string> {
    return `hashed-${password}`;
  }

  async compare(
    password: string,
    hash: string
  ): Promise<boolean> {
    return hash === `hashed-${password}`;
  }
}