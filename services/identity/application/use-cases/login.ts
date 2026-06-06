import { IUserRepository } from "../../domain/repositories/iuser";
import { ISessionRepository } from "../../domain/repositories/isession";
import { IPasswordHasher } from "../../domain/services/ipassword-hasher";
import { ITokenService } from "../../domain/services/itoken";
import { InvalidCredentialsError } from "../../domain/errors/invalid-credentials";
import { Session } from "../../domain/entities/session";
import { LoginUserResponseDTO } from "../../domain/dtos/auth-response";
import { LoginUserInputDTO } from "../../domain/dtos/login";

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: LoginUserInputDTO): Promise<LoginUserResponseDTO> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const accessToken = this.tokenService.generateAccessToken(
      user.id as string,
    );

    const refreshToken = this.tokenService.generateRefreshToken(
      user.id as string,
    );

    const session = new Session(
      crypto.randomUUID(),
      user.id as string,
      refreshToken,
      new Date(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    await this.sessionRepository.create(session);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id as string,
        email: user.email,
        role: user.role,
      },
    };
  }
}
