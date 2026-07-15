import "dotenv/config";
import prisma from "./src/config/prisma";
import { hashPassword } from "./src/utils/hash";

async function main() {
  const roles = ["ADMIN", "MANAGER", "MEMBER"];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `${roleName} role` },
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: "ADMIN" },
  });

  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "password";
  const hashedPassword = await hashPassword(adminPassword);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
    },
    create: {
      firstName: "Admin",
      lastName: "User",
      email: adminEmail,
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log("Roles seeded successfully!");
  console.log(`Admin user ready: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

