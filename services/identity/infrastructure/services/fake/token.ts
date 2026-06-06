import { ITokenService } from "../../../domain/services/itoken";


export class FakeTokenService implements ITokenService {
  generateAccessToken(userId: string): string {
    return `access-token-${userId}`;
  }

  generateRefreshToken(userId: string): string {
    return `refresh-token-${userId}`;
  }
}