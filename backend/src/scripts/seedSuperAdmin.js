import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";

const seedSuperAdmin = async () => {
  try {
    if (!env.superAdminEmail || !env.superAdminPassword) {
      throw new Error("SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD is missing in .env");
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: env.superAdminEmail.trim().toLowerCase() },
    });

    if (existingAdmin) {
      console.log("Super admin already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(env.superAdminPassword, 10);

    const superAdmin = await prisma.user.create({
      data: {
        name: env.superAdminName,
        email: env.superAdminEmail.trim().toLowerCase(),
        password: hashedPassword,
        role: "SUPER_ADMIN",
        instituteId: null,
      },
    });

    console.log("Super admin created successfully.");
    console.log({
      id: superAdmin.id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role,
    });
  } catch (error) {
    console.error("Error seeding super admin:", error);
  } finally {
    await prisma.$disconnect();
  }
};

seedSuperAdmin();