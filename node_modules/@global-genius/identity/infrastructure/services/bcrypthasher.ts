import bcrypt from "bcrypt";
import { IPasswordHasher } from "../../domain/services/ipassword-hasher";

export class BcryptHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
