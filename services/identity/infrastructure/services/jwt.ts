import jwt from "jsonwebtoken";
import { ITokenService } from "../../domain/services/itoken";

export class JwtTokenService implements ITokenService {
  generateAccessToken(userId: string) {
    return jwt.sign(
      { sub: userId },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );
  }

  generateRefreshToken(userId: string) {
    return jwt.sign(
      { sub: userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );
  }
}