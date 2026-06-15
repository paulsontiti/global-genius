import { prisma,UserRole, PrismaUserRepository, PrismaRegisterRepository } from "@global-genius/database";
import { beforeEach, describe, expect, it } from "vitest";
import { User } from "../../../services/identity/domain/entities/user";

describe("UserRepository", () => {
  const userRepository = new PrismaUserRepository();
  const registerRepository = new PrismaRegisterRepository()

  beforeEach(async () => {
    await prisma.user.deleteMany();
  }, 1000000);

  let user = User.create({
    email: "test@test.com",
    password: "hashed",
    
  });
  // it("should create user", async () => {
  //   await userRepository.create(user);

  //   const found = await prisma.user.findUnique({
  //     where: { email: user.email },
  //   });

  //   expect(found).not.toBeNull();
  // });

  // it("should find user by email", async () => {
  //   await userRepository.create(user);

  //   const result = await userRepository.findByEmail(user.email);

  //   expect(result).not.toBeNull();
  //   expect(result!.email).toBe(user.email);
  // });

  // it("should return null if user does not exist", async () => {
  //   const result = await userRepository.findByEmail("ghost@test.com");

  //   expect(result).toBeNull();
  // });

  it("should update user", async () => {
    const dbUser = await registerRepository.create(user);

    user.changeRole("MENTOR" as UserRole);
    const { id, ...data } = user;

    const updated = await userRepository.update(dbUser.id, data);

    expect(updated!.role).toBe("MENTOR");
  });

  it("should delete user", async () => {
    const dbUser = await registerRepository.create(user);

    await userRepository.delete(dbUser.id);
    const found = await userRepository.findById(dbUser.id);

    expect(found).toBeNull();
  });

  it("should implement IUserRepository contract", async () => {
  expect(userRepository.update).toBeDefined();
  expect(userRepository.delete).toBeDefined();
  expect(userRepository.findById).toBeDefined();
});
});
