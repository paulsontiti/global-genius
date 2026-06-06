export class Session {
  constructor(
      public readonly id: string,
    public readonly userId: string,
    public refreshToken: string,
    public createdAt: Date,
    public expiresAt: Date,
  ) {}

  changeRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken;
  }
  changeCreatedAt(createdAt: Date) {
    this.createdAt = createdAt;
  }
  changeExpiresAt(expiresAt: Date) {
    this.expiresAt = expiresAt;
  }
}
