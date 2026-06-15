import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  RegisterController,
  RegisterRequest,
} from "../../../apps/api/src/identity/controllers/register";
import { createMockReply } from "../../test-utils/mocks";
import { buildApp } from "../../../apps/api/src/app";
import { prisma } from "@global-genius/database";

describe("RegisterController", () => {
  let controller: RegisterController;

  let registerUserUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    registerUserUseCase = {
      execute: vi.fn(),
    };

    controller = new RegisterController(registerUserUseCase as any);
  });

  it("should register a user", async () => {
    const request = {
      body: {
        email: "john@test.com",
        password: "Password123!",
        role: "student",
      },
    } as unknown as RegisterRequest;

    const response = {
      userId: "user-1",
    };

    registerUserUseCase.execute.mockResolvedValue(response);

    const reply = createMockReply();

    await controller.handle(request, reply as any);

    expect(registerUserUseCase.execute).toHaveBeenCalledOnce();

    expect(registerUserUseCase.execute).toHaveBeenCalledWith(request.body);

    expect(reply.code).toHaveBeenCalledWith(201);

    expect(reply.send).toHaveBeenCalledWith(response);
  });

  it("should call use case once", async () => {
    const request = {
      body: {
        email: "test@test.com",
        password: "Password123!",
        role: "student",
      },
    } as unknown as RegisterRequest;
    registerUserUseCase.execute.mockResolvedValue({
      userId: "1",
    });

    const reply = createMockReply();

    await controller.handle(request, reply as any);

    expect(registerUserUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it("should call use case once", async () => {
    const request = {
      body: {
        email: "test@test.com",
        password: "Password123!",
        role: "student",
      },
    } as unknown as RegisterRequest;
    registerUserUseCase.execute.mockResolvedValue({
      userId: "1",
    });

    const reply = createMockReply();

    await controller.handle(request, reply as any);

    expect(registerUserUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it("should propagate use case errors", async () => {
    registerUserUseCase.execute.mockRejectedValue(
      new Error("User already exists"),
    );

    const reply = createMockReply();
    const request = {
      body: {
        email: "test@test.com",
        password: "Password123!",
        role: "student",
      },
    } as unknown as RegisterRequest;

    await expect(controller.handle(request, reply as any)).rejects.toThrow(
      "User already exists",
    );
  });

  it("should pass correct payload to use case", async () => {
    registerUserUseCase.execute.mockResolvedValue({
      userId: "1",
    });
    const request = {
      body: {
        email: "test@test.com",
        password: "Password123!",
        role: "student",
      },
    } as unknown as RegisterRequest;

    const reply = createMockReply();

    await controller.handle(request, reply as any);

    expect(registerUserUseCase.execute).toHaveBeenCalledWith(request.body);
  });

  it("POST /register should return 201", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/register",
      payload: {
        email: "johnny@test.com",
        password: "Password123!",
      },
    });

    expect(response.statusCode).toBe(201);
  }, 100000);
});
