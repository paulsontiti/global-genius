import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryUserRepository } from "../../../services/identity/infrastructure/repositories/in-memory/user";
import { InMemorySessionRepository } from "../../../services/identity/infrastructure/repositories/in-memory/session";
import { User as UserEntity } from "../../../services/identity/domain/entities/user";
import { LoginUserUseCase } from "../../../services/identity/application/use-cases/login";
import { FakePasswordHasher } from "../../../services/identity/infrastructure/services/fake/hasher";
import { FakeTokenService } from "../../../services/identity/infrastructure/services/fake/token";

import { IPasswordHasher } from "../../../services/identity/domain/services/ipassword-hasher";
import { ITokenService } from "../../../services/identity/domain/services/itoken";
import { InvalidCredentialsError } from "../../../services/identity/domain/errors/invalid-credentials";
import {
  ILoginRepository,
  IRegisterRepository,
  ISessionRepository,
  IUserRepository,
  PrismaLoginRepository,
  PrismaRegisterRepository,
  PrismaSessionRepository,
  PrismaUserRepository,
  User,
} from "@global-genius/database";
import { BcryptHasher } from "../../../services/identity/infrastructure/services/bcrypthasher";
import { JwtTokenService } from "../../../services/identity/infrastructure/services/jwt";

let userRepo: any;
let sessionRepo: ISessionRepository;
let hasher: IPasswordHasher;
let tokenService: ITokenService;
let useCase: LoginUserUseCase;
let user: UserEntity;
let dbUser: User;
let loginRepository: ILoginRepository;
let registerRepository:IRegisterRepository;

describe("LoginUserUseCase", () => {
  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    sessionRepo = new InMemorySessionRepository();
    


    hasher = new FakePasswordHasher();
    tokenService = new FakeTokenService();

    user = UserEntity.create({
      email: "john@example.com",
      password: await hasher.hash("password123"),
    });

    dbUser = await userRepo.create(user);

    useCase = new LoginUserUseCase(userRepo, sessionRepo, hasher, tokenService);
  });
  it("should authenticate a valid user", async () => {
    const result = await useCase.execute({
      email: "john@example.com",
      password: "password123",
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.id).toBe(dbUser.id);
  });

  it("should throw for invalid password", async () => {
    const user = UserEntity.create({
      email: "john@example.com",
      password: await hasher.hash("password123"),
    });

    await userRepo.create(user);

    const useCase = new LoginUserUseCase(
      userRepo,
      sessionRepo,
      hasher,
      tokenService,
    );

    await expect(
      useCase.execute({
        email: "john@example.com",
        password: "wrong-password",
      }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("should throw when user does not exist", async () => {
    const user = UserEntity.create({
      email: "john@example.com",
      password: await hasher.hash("password123"),
    });

    await userRepo.create(user);

    const useCase = new LoginUserUseCase(
      userRepo,
      sessionRepo,
      hasher,
      tokenService,
    );

    await expect(
      useCase.execute({
        email: "johndoe@example.com",
        password: "password123",
      }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it("should create a session", async () => {
    await useCase.execute({
      email: user.email,
      password: "password123",
    });

    const items = await sessionRepo.getSessions();
    expect(items).toHaveLength(1);
  });

  it("should create session linked to the authenticated user", async () => {
    await useCase.execute({
      email: user.email,
      password: "password123",
    });

    const items = await sessionRepo.getSessions();
    expect(items[0].userId).toBe(dbUser.id);
  });

  it("should generate an access token", async () => {
    const result = await useCase.execute({
      email: user.email,
      password: "password123",
    });

    expect(result.accessToken).toContain(dbUser.id);
  });
  it("should generate a refresh token", async () => {
    const result = await useCase.execute({
      email: user.email,
      password: "password123",
    });

    expect(result.refreshToken).toContain(dbUser.id);
  });

  it("should store refresh token in session", async () => {
    const result = await useCase.execute({
      email: user.email,
      password: "password123",
    });

    const items = await sessionRepo.getSessions();
    expect(items[0].refreshToken).toBe(result.refreshToken);
  });

  it("should return authenticated user data", async () => {
    const result = await useCase.execute({
      email: user.email,
      password: "password123",
    });

    expect(result.user).toEqual({
      id: dbUser.id,
      email: user.email,
      role: user.role,
    });
  });

  it("should compare password hash", async () => {
    const compareSpy = vi.spyOn(hasher, "compare");

    await useCase.execute({
      email: user.email,
      password: "password123",
    });

    expect(compareSpy).toHaveBeenCalledOnce();
  });

  it("should generate tokens", async () => {
    const accessSpy = vi.spyOn(tokenService, "generateAccessToken");

    const refreshSpy = vi.spyOn(tokenService, "generateRefreshToken");

    await useCase.execute({
      email: user.email,
      password: "password123",
    });

    expect(accessSpy).toHaveBeenCalledOnce();
    expect(refreshSpy).toHaveBeenCalledOnce();
  });

  it("should persist session", async () => {
    const createSpy = vi.spyOn(sessionRepo, "create");

    await useCase.execute({
      email: user.email,
      password: "password123",
    });

    expect(createSpy).toHaveBeenCalledOnce();
  });

  it("should not create session for invalid password", async () => {
    await expect(
      useCase.execute({
        email: user.email,
        password: "wrong",
      }),
    ).rejects.toThrow();

    const items = await sessionRepo.getSessions();
    expect(items).toHaveLength(0);
  });

  it("should not generate tokens when user is missing", async () => {
    const accessSpy = vi.spyOn(tokenService, "generateAccessToken");

    await expect(
      useCase.execute({
        email: "missing@test.com",
        password: "password123",
      }),
    ).rejects.toThrow();

    expect(accessSpy).not.toHaveBeenCalled();
  });

  it("should not return password hash", async () => {
    const result = await useCase.execute({
      email: user.email,
      password: "password123",
    });

    expect(result.user).not.toHaveProperty("passwordHash");
  });

  it("should login a MENTOR", async () => {
    const MENTOR = UserEntity.create({
      email: "MENTOR@test.com",
      password: await hasher.hash("123456"),
    });

    const dbUser = await userRepo.create(MENTOR);
    await userRepo.update(dbUser.id, { role: "MENTOR" });

    const result = await useCase.execute({
      email: MENTOR.email,
      password: "123456",
    });

    expect(result.user.role).toBe("MENTOR");
  });
});

describe("Persistence LoginUserUseCase", () => {
  beforeEach(async () => {
    userRepo = new PrismaUserRepository();
    sessionRepo = new PrismaSessionRepository();
    registerRepository = new PrismaRegisterRepository();
    loginRepository = new PrismaLoginRepository();

    hasher = new BcryptHasher();
    tokenService = new JwtTokenService();

    user = UserEntity.create({
      email: "john@example.com",
      password: await hasher.hash("password123"),
    });

    await registerRepository.create(user);

    useCase = new LoginUserUseCase(loginRepository, sessionRepo, hasher, tokenService);
  },100000);
  it("should create session on login", async () => {
    const resData = await useCase.execute({
      email: "john@example.com",
      password: "password123",
    });

    const session = await sessionRepo.findByUserId(resData.user.id);

    expect(session).not.toBeNull();
  });

  it("should fail login for invalid credentials", async () => {
    await expect(
      useCase.execute({
        email: "wrong@test.com",
        password: "wrongpass",
      }),
    ).rejects.toThrow(InvalidCredentialsError);
  });
});
