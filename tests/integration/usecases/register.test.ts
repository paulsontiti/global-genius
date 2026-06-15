import { describe, it, expect, vi, beforeEach } from "vitest";
import { InMemoryUserRepository } from "../../../services/identity/infrastructure/repositories/in-memory/user";
import { RegisterUserUseCase } from "../../../services/identity/application/use-cases/register";
import { EmailAlreadyExistsError } from "../../../services/identity/domain/errors/email-already-exist";
import { prisma, PrismaLoginRepository, PrismaRegisterRepository, PrismaUserRepository } from "@global-genius/database";
import { BcryptHasher } from "../../../services/identity/infrastructure/services/bcrypthasher";
import { InvalidEmailError } from "../../../services/identity/domain/errors/invalid-email";
import { InvalidPasswordError } from "../../../services/identity/domain/errors/invalid-passowr";

describe("RegisterUserUseCase", () => {
  const repo = new InMemoryUserRepository();
  const hasher = {
    hash: vi.fn(),
    compare: vi.fn(),
  };

  beforeEach(() => {
    repo.deteteUsers();
  });
  const useCase = new RegisterUserUseCase(repo,repo, hasher);
  it("should register a new user", async () => {
    const user = await useCase.execute({
      email: "test@gmail.com",
      password: "123456",
    });

    expect(user?.email).toBe("test@gmail.com");
    expect(user?.id).toBeDefined();
    expect(user?.role).toBe("STUDENT");
  });

  it("should persist the user", async () => {
    const createSpy = vi.spyOn(repo, "create");

    await useCase.execute({
      email: "john@example.com",
      password: "password123",
    });

    expect(createSpy).toHaveBeenCalledOnce();
  });

  it("should hash Haspassword before persisting", async () => {
    const createHasher = vi.spyOn(hasher, "hash");
    const user = await useCase.execute({
      email: "john@example.com",
      password: "password123",
    });

    expect(createHasher).toHaveBeenCalled();
  });

  it("should hash the password", async () => {
    const hashSpy = vi.spyOn(hasher, "hash");

    await useCase.execute({
      email: "john@example.com",
      password: "password123",
    });

    expect(hashSpy).toHaveBeenCalled();
  });

  it("should throw when email already exists", async () => {
    await useCase.execute({
      email: "john@example.com",
      password: "password123",
    });

    await expect(
      useCase.execute({
        email: "john@example.com",
        password: "another-password",
      }),
    ).rejects.toThrow(EmailAlreadyExistsError);
  });

  it("should not create a duplicate user", async () => {
    await useCase.execute({
      email: "john@example.com",
      password: "password123",
    });

    await expect(
      useCase.execute({
        email: "john@example.com",
        password: "another-password",
      }),
    ).rejects.toThrow();

    const users = await repo.getAllUsers();
    expect(users).toHaveLength(1);
  });

  it("should store hashed password", async () => {
    await useCase.execute({
      email: "john@example.com",
      password: "password123",
    });

    const user = await repo.getAllUsers();

    expect(user[0].password).not.toBe("password123");
  });

  it("should register a STUDENT", async () => {
    const user = await useCase.execute({
      email: "STUDENT@test.com",
      password: "password123",
    });

    expect(user?.role).toBe("STUDENT");
  });

  // it("should register a MENTOR", async () => {
  //   const user = await useCase.execute({
  //     email: "MENTOR@test.com",
  //     password: "password123",
  //   });

  //   expect(user?.role).toBe("MENTOR");
  // });

  // it("should register a COMPANY", async () => {
  //   const user = await useCase.execute({
  //     email: "COMPANY@test.com",
  //     password: "password123",
  //   });

  //   expect(user?.role).toBe("COMPANY");
  // });

  it("should generate unique ids", async () => {
    const user1 = await useCase.execute({
      email: "john1@test.com",
      password: "password123",
    });

    const user2 = await useCase.execute({
      email: "john2@test.com",
      password: "password123",
    });

    expect(user1?.id).not.toBe(user2?.id);
  });

  it("should preserve email", async () => {
    const user = await useCase.execute({
      email: "john@example.com",
      password: "password123",
    });

    expect(user?.email).toBe("john@example.com");
  });

  it("should not expose plain password", async () => {
    const user = await useCase.execute({
      email: "john@example.com",
      password: "password123",
    });

    expect(user).not.toHaveProperty("password");
  });

  it("should check for existing email", async () => {
    const findSpy = vi.spyOn(repo, "findByEmail");

    await useCase.execute({
      email: "john@example.com",
      password: "password123",
    });

    expect(findSpy).toHaveBeenCalledOnce();
  });

  it("should create a valid user entity", async () => {
    const user = await useCase.execute({
      email: "john@example.com",
      password: "password123",
    });

    expect(user?.id).toBeDefined();
    expect(user?.createdAt).toBeInstanceOf(Date);
  });

  it("should throw for invalid email", async () => {
    await expect(
      useCase.execute({
        email: "invalid-email",
        password: "password123",
      }),
    ).rejects.toThrow();
  });

  it("should throw for empty email", async () => {
    await expect(
      useCase.execute({
        email: "",
        password: "password123",
      }),
    ).rejects.toThrow();
  });

  it("should throw for empty password", async () => {
    await expect(
      useCase.execute({
        email: "john@example.com",
        password: "",
      }),
    ).rejects.toThrow();
  });
});

describe("Persistence RegisterUsecase", () => {
  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  }, 100000);
  const loginRepo = new PrismaLoginRepository();
  const registerRepo = new PrismaRegisterRepository();
  const hasher = new BcryptHasher();
  const useCase = new RegisterUserUseCase(loginRepo,registerRepo, hasher);
  it("should register user and persist in database", async () => {
    await useCase.execute({
      email: "john@test.com",
      password: "password123",
    });

    const user = await prisma.user.findUnique({
      where: { email: "john@test.com" },
    });

    expect(user).not.toBeNull();
  });

  it("should not allow duplicate email", async () => {
    await useCase.execute({
      email: "dup@test.com",
      password: "password123",
    });

    await expect(
      useCase.execute({
        email: "dup@test.com",
        password: "password123",
      }),
    ).rejects.toThrow();
  });

  it("should reject invalid email", async () => {
    await expect(
      useCase.execute({
        email: "invalid-email",
        password: "password123",
      }),
    ).rejects.toThrow(InvalidEmailError);
  });

  it("should reject empty password", async () => {
    await expect(
      useCase.execute({
        email: "test@test.com",
        password: "",
      }),
    ).rejects.toThrow(InvalidPasswordError);
  });
});
