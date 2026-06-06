import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { InMemoryUserRepository } from "../../../services/identity/infrastructure/repositories/in-memory/user";
import { RegisterUserUseCase } from "../../../services/identity/application/use-cases/register";
import { EmailAlreadyExistsError } from "../../../services/identity/domain/errors/email-already-exist";

const repo = new InMemoryUserRepository();
const hasher = {
  hash: vi.fn(),
  compare: vi.fn()
}

beforeEach(()=>{
  repo.deteteUsers()
})
const useCase = new RegisterUserUseCase(repo,hasher);
describe("RegisterUserUseCase", () => {
  it("should register a new user", async () => {

    const user = await useCase.execute({
      email: "test@gmail.com",
      password: "123456",
      role: "student",
    });

    expect(user?.email).toBe("test@gmail.com");
      expect(user?.id).toBeDefined();
  expect(user?.role).toBe("student");
  });

  it("should persist the user", async () => {
  const createSpy = vi.spyOn(
    repo,
    "create"
  );

  await useCase.execute({
    email: "john@example.com",
    password: "password123",
    role: "student",
  });

  expect(createSpy).toHaveBeenCalledOnce();
});

it("should hash password before persisting", async () => {
  const user = await useCase.execute({
    email: "john@example.com",
    password: "password123",
    role: "student",
  });

  expect(user?.passwordHash)
    .not.toBe("password123");
});

it("should hash the password", async () => {
  const hashSpy = vi.spyOn(
    hasher,
    "hash"
  );

  await useCase.execute({
    email: "john@example.com",
    password: "password123",
    role: "student",
  });

  expect(hashSpy).toHaveBeenCalled();
});

it("should throw when email already exists", async () => {
  await useCase.execute({
    email: "john@example.com",
    password: "password123",
    role: "student",
  });

  await expect(
    useCase.execute({
      email: "john@example.com",
      password: "another-password",
      role: "student",
    })
  ).rejects.toThrow(
    EmailAlreadyExistsError
  );
});

it("should not create a duplicate user", async () => {
  await useCase.execute({
    email: "john@example.com",
    password: "password123",
    role: "student",
  });

  await expect(
    useCase.execute({
      email: "john@example.com",
      password: "another-password",
      role: "student",
    })
  ).rejects.toThrow();

  const users = await repo.getAllUsers();
  expect(users
  ).toHaveLength(1);
});

it("should store hashed password", async () => {
  await useCase.execute({
    email: "john@example.com",
    password: "password123",
    role: "student",
  });

  const user = await repo.getAllUsers();

  expect(user[0].passwordHash)
    .not.toBe("password123");
});

it("should register a student", async () => {
  const user = await useCase.execute({
    email: "student@test.com",
    password: "password123",
    role: "student",
  });

  expect(user?.role)
    .toBe("student");
});

it("should register a mentor", async () => {
  const user = await useCase.execute({
    email: "mentor@test.com",
    password: "password123",
    role: "mentor",
  });

  expect(user?.role)
    .toBe("mentor");
});

it("should register a company", async () => {
  const user = await useCase.execute({
    email: "company@test.com",
    password: "password123",
    role: "company",
  });

  expect(user?.role)
    .toBe("company");
});

it("should generate unique ids", async () => {
  const user1 = await useCase.execute({
    email: "john1@test.com",
    password: "password123",
    role: "student",
  });

  const user2 = await useCase.execute({
    email: "john2@test.com",
    password: "password123",
    role: "student",
  });

  expect(user1?.id)
    .not.toBe(user2?.id);
});

it("should preserve email", async () => {
  const user = await useCase.execute({
    email: "john@example.com",
    password: "password123",
    role: "student",
  });

  expect(user?.email)
    .toBe("john@example.com");
});

it("should not expose plain password", async () => {
  const user = await useCase.execute({
    email: "john@example.com",
    password: "password123",
    role: "student",
  });

  expect(user)
    .not.toHaveProperty("password");
});

it("should check for existing email", async () => {
  const findSpy = vi.spyOn(
    repo,
    "findByEmail"
  );

  await useCase.execute({
    email: "john@example.com",
    password: "password123",
    role: "student",
  });

  expect(findSpy)
    .toHaveBeenCalledOnce();
});

it("should create a valid user entity", async () => {
  const user = await useCase.execute({
    email: "john@example.com",
    password: "password123",
    role: "student",
  });

  expect(user?.id).toBeDefined();
  expect(user?.createdAt).toBeInstanceOf(Date);
});

it("should throw for invalid email", async () => {
  await expect(
    useCase.execute({
      email: "invalid-email",
      password: "password123",
      role: "student",
    })
  ).rejects.toThrow();
});

it("should throw for empty email", async () => {
  await expect(
    useCase.execute({
      email: "",
      password: "password123",
      role: "student",
    })
  ).rejects.toThrow();
});


it("should throw for empty password", async () => {
  await expect(
    useCase.execute({
      email: "john@example.com",
      password: "",
      role: "student",
    })
  ).rejects.toThrow();
});

});
