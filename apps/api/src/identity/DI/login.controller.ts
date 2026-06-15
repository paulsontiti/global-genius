import { PrismaLoginRepository, PrismaSessionRepository } from "@global-genius/database";
import { BcryptHasher } from "../../../../../services/identity/infrastructure/services/bcrypthasher";
import { LoginController } from "../controllers/login";
import { LoginUserUseCase } from "../../../../../services/identity/application/use-cases/login";
import { JwtTokenService } from "../../../../../services/identity/infrastructure/services/jwt";
export function makeLoginController() {

    const loginRepository = new PrismaLoginRepository();
    const sessionRepository = new PrismaSessionRepository();

  const hasher =
    new BcryptHasher();

    const tokenService = new JwtTokenService()

  const useCase =
    new LoginUserUseCase(
      loginRepository,sessionRepository,
      hasher,tokenService
    );

  return new LoginController(
    useCase
  );
}