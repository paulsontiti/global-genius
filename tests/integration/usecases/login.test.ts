import {  beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryUserRepository } from "../../../services/identity/infrastructure/repositories/in-memory/user";
import { InMemorySessionRepository } from "../../../services/identity/infrastructure/repositories/in-memory/session";
import { User } from "../../../services/identity/domain/entities/user";
import { LoginUserUseCase } from "../../../services/identity/application/use-cases/login";
import { FakePasswordHasher } from "../../../services/identity/infrastructure/services/fake/hasher";
import { FakeTokenService } from "../../../services/identity/infrastructure/services/fake/token";
import { IUserRepository } from "../../../services/identity/domain/repositories/iuser";
import { ISessionRepository } from "../../../services/identity/domain/repositories/isession";
import { IPasswordHasher } from "../../../services/identity/domain/services/ipassword-hasher";
import { ITokenService } from "../../../services/identity/domain/services/itoken";
import { InvalidCredentialsError } from "../../../services/identity/domain/errors/invalid-credentials";

let userRepo: IUserRepository;
let sessionRepo: ISessionRepository;
let hasher: IPasswordHasher;
let tokenService: ITokenService;
let useCase: LoginUserUseCase;
let user:User;


beforeEach(async() => {
  userRepo = new InMemoryUserRepository();
  sessionRepo = new InMemorySessionRepository();

  hasher = new FakePasswordHasher();
  tokenService = new FakeTokenService();

   user = User.create({
      email: "john@example.com",
      passwordHash: await hasher.hash("password123"),
      role: "student",
    });

    await userRepo.create(user);

    useCase = new LoginUserUseCase(
      userRepo,
      sessionRepo,
      hasher,
      tokenService,
    );
});



describe("LoginUserUseCase", () => {
  it("should authenticate a valid user", async () => {
    

    const result = await useCase.execute({
      email: "john@example.com",
      password: "password123",
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.id).toBe(user.id);
  });

  it("should throw for invalid password", async () => {


    const user = User.create({
      email: "john@example.com",
      passwordHash: await hasher.hash("password123"),
      role: "student",
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

    const user = User.create({
      email: "john@example.com",
      passwordHash: await hasher.hash("password123"),
      role: "student",
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
      password: "password123"
    })
  ).rejects.toThrow(InvalidCredentialsError);
});

it("should create a session", async () => {
  await useCase.execute({
    email: user.email,
    password: "password123"
  });

  const items = await sessionRepo.getSessions();
  expect(items).toHaveLength(1);
});

it("should create session linked to the authenticated user", async () => {
  await useCase.execute({
    email: user.email,
    password: "password123"
  });

  const items = await sessionRepo.getSessions();
  expect(items[0].userId
  ).toBe(user.id);
});

it("should generate an access token", async () => {
  const result = await useCase.execute({
    email: user.email,
    password: "password123"
  });

  expect(result.accessToken).toContain(
    user.id
  );
});
it("should generate a refresh token", async () => {
  const result = await useCase.execute({
    email: user.email,
    password: "password123"
  });

  expect(result.refreshToken).toContain(
    user.id
  );
});

it("should store refresh token in session", async () => {
  const result = await useCase.execute({
    email: user.email,
    password: "password123"
  });

  const items = await sessionRepo.getSessions();
  expect(
    items[0].refreshToken
  ).toBe(result.refreshToken);
});

it("should return authenticated user data", async () => {
  const result = await useCase.execute({
    email: user.email,
    password: "password123"
  });

  expect(result.user).toEqual({
    id: user.id,
    email: user.email,
    role: user.role
  });
});

it("should compare password hash", async () => {
  const compareSpy = vi.spyOn(
    hasher,
    "compare"
  );

  await useCase.execute({
    email: user.email,
    password: "password123"
  });

  expect(compareSpy).toHaveBeenCalledOnce();
});

it("should generate tokens", async () => {
  const accessSpy = vi.spyOn(
    tokenService,
    "generateAccessToken"
  );

  const refreshSpy = vi.spyOn(
    tokenService,
    "generateRefreshToken"
  );

  await useCase.execute({
    email: user.email,
    password: "password123"
  });

  expect(accessSpy).toHaveBeenCalledOnce();
  expect(refreshSpy).toHaveBeenCalledOnce();
});

it("should persist session", async () => {
  const createSpy = vi.spyOn(
    sessionRepo,
    "create"
  );

  await useCase.execute({
    email: user.email,
    password: "password123"
  });

  expect(createSpy).toHaveBeenCalledOnce();
});

it("should not create session for invalid password", async () => {
  await expect(
    useCase.execute({
      email: user.email,
      password: "wrong"
    })
  ).rejects.toThrow();

  const items = await sessionRepo.getSessions();
  expect(
    items
  ).toHaveLength(0);
});

it("should not generate tokens when user is missing", async () => {
  const accessSpy = vi.spyOn(
    tokenService,
    "generateAccessToken"
  );

  await expect(
    useCase.execute({
      email: "missing@test.com",
      password: "password123"
    })
  ).rejects.toThrow();

  expect(accessSpy).not.toHaveBeenCalled();
});

it("should not return password hash", async () => {
  const result = await useCase.execute({
    email: user.email,
    password: "password123"
  });

  expect(result.user).not.toHaveProperty(
    "passwordHash"
  );
});

it("should login a mentor", async () => {
  const mentor = User.create({
    email: "mentor@test.com",
    passwordHash: await hasher.hash("123456"),
    role: "mentor"
  });

  await userRepo.create(mentor);

  const result = await useCase.execute({
    email: mentor.email,
    password: "123456"
  });

  expect(result.user.role).toBe("mentor");
});

});
