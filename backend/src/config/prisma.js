import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

// Simple Prisma Client - no adapter needed for Prisma 6
export const prisma = new PrismaClient();

// Test connection
prisma.$connect()
  .then(() => console.log('✅ Connected to MySQL successfully!'))
  .catch((error) => console.error('❌ MySQL connection failed:', error));