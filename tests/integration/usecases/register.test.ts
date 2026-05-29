import { describe, it, expect } from "vitest";
import { InMemoryUserRepository } from "../../../services/identity/infrastructure/repositories/in-memory/user";
import { RegisterUserUseCase } from "../../../services/identity/application/use-cases/register";

describe("RegisterUserUseCase", () => {
  it("should register a new user", async () => {
    const repo = new InMemoryUserRepository();
    const useCase = new RegisterUserUseCase(repo);

    const user = await useCase.execute({
      email: "test@gmail.com",
      password: "123456",
      role: "student",
    });

    expect(user?.email).toBe("test@gmail.com");
  });
});
