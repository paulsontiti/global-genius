import { prisma } from "@global-genius/database";

export async function clearDatabase() {
  const collections = await prisma.$runCommandRaw({
    listCollections: 1,
  });

  // safer approach: manually clear known collections
  await prisma.user.deleteMany();
  await prisma.session.deleteMany();
}