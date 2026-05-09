import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Check if super admin already exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      role: "SUPER_ADMIN",
    },
  });

  if (existingSuperAdmin) {
    console.log("✅ Super admin already exists, skipping creation.");
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);

  // Create super admin
  const superAdmin = await prisma.user.create({
    data: {
      name: process.env.SUPER_ADMIN_NAME,
      email: process.env.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      isEmailVerified: true, // Super admin is pre-verified
    },
  });

  console.log("✅ Super admin created successfully!");
  console.log(`📧 Email: ${superAdmin.email}`);
  console.log(`👤 Name: ${superAdmin.name}`);
  console.log(`🔑 Role: ${superAdmin.role}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });