import { UserRole } from "../entities/user";

export interface UserCreateDTO {
  email: string;
  passwordHash: string;
  role: UserRole;
}
