import { PrismaLoginRepository, PrismaRegisterRepository } from "@global-genius/database";
import { RegisterUserUseCase } from "../../../../../services/identity/application/use-cases/register";
import { RegisterController } from "../controllers/register";
import { BcryptHasher } from "../../../../../services/identity/infrastructure/services/bcrypthasher";

export function makeRegisterController() {
  const registerRepository =
    new PrismaRegisterRepository();

    const loginRepository = new PrismaLoginRepository();

  const hasher =
    new BcryptHasher();

  const useCase =
    new RegisterUserUseCase(
      loginRepository,registerRepository,
      hasher
    );

  return new RegisterController(
    useCase
  );
}