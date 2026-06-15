import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LoginController,
  LoginRequest,
} from "../../../apps/api/src/identity/controllers/login";
import { createMockReply } from "../../test-utils/mocks";
import { buildApp } from "../../../apps/api/src/app";
import { prisma } from "@global-genius/database";

describe("LoginController", () => {
  let controller: LoginController;

  let loginUserUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };

  let request: LoginRequest;

  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    loginUserUseCase = {
      execute: vi.fn(),
    };
    request = {
      body: {
        email: "john@test.com",
        password: "Password123!",
      },
    } as unknown as LoginRequest;
    controller = new LoginController(loginUserUseCase as any);
  });

  it("should login successfully", async () => {
    const response = {
      accessToken: "access",
      refreshToken: "refresh",
    };

    loginUserUseCase.execute.mockResolvedValue(response);

    const reply = createMockReply();

    await controller.handle(request, reply as any);

    expect(reply.code).toHaveBeenCalledWith(201);

    expect(reply.send).toHaveBeenCalledWith(response);
  });

  it("should call login use case once", async () => {
    loginUserUseCase.execute.mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
    });

    const reply = createMockReply();

    await controller.handle(request, reply as any);

    expect(loginUserUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it("should pass credentials to use case", async () => {
    loginUserUseCase.execute.mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
    });

    const reply = createMockReply();

    await controller.handle(request, reply as any);

    expect(loginUserUseCase.execute).toHaveBeenCalledWith(request.body);
  });

  it("should propagate invalid credentials error", async () => {
    loginUserUseCase.execute.mockRejectedValue(
      new Error("Invalid credentials"),
    );

    const reply = createMockReply();

    await expect(controller.handle(request, reply as any)).rejects.toThrow(
      "Invalid credentials",
    );
  });

//   it("POST /login should return 201", async () => {
//     const app = buildApp();

//     await app.inject({
//       method: "POST",
//       url: "/api/v1/auth/register",
//       payload: {
//         email: "john@test.com",
//         password: "Password123!",
//       },
//     });

// //     const response = await app.inject({
// //       method: "POST",
// //       url: "/api/v1/auth/login",
// //       payload: {
// //         email: "john@test.com",
// //         password: "Password123!",
// //       },
// //     });

// //     expect(response.statusCode).toBe(201);
//  }, 100000);
});
