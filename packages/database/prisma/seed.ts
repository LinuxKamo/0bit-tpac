import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "bcryptjs";
const { hash } = pkg;
import { PrismaClient } from "../generated/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function main() {
  if (!process.env.DATABASE_URL)
    throw new Error("❌ DATABASE_URL missing from .env");
  if (!process.env.SEED_SUPER_ADMIN_EMAIL)
    throw new Error("❌ SEED_SUPER_ADMIN_EMAIL missing from .env");
  if (!process.env.SEED_SUPER_ADMIN_PASSWORD)
    throw new Error("❌ SEED_SUPER_ADMIN_PASSWORD missing from .env");

  const pool = new pg.Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as any);

  try {
    console.log("🌱 Seeding database...");

    await prisma.systemSetting.upsert({
      where: { key: "registration_mode" },
      update: {},
      create: { key: "registration_mode", value: "INVITE_ONLY" },
    });

    await prisma.systemSetting.upsert({
      where: { key: "app_name" },
      update: {},
      create: { key: "app_name", value: "Tshimologong Platform" },
    });

    await prisma.systemSetting.upsert({
      where: { key: "platform_version" },
      update: {},
      create: { key: "platform_version", value: "1.0.0" },
    });

    const password = await hash(process.env.SEED_SUPER_ADMIN_PASSWORD, 12);
    const superAdmin = await prisma.user.upsert({
      where: { email: process.env.SEED_SUPER_ADMIN_EMAIL },
      update: {},
      create: {
        email: process.env.SEED_SUPER_ADMIN_EMAIL,
        password,
        role: "SUPER_ADMIN",
        accountStatus: "ACTIVE",
        firstName: "Super",
        lastName: "Admin",
        displayName: "Super Admin",
      },
    });

    console.log(`✅ Super admin: ${superAdmin.email}`);
    console.log(`\n⚠️  Change this password immediately after first login!`);
    console.log(
      `   (Credentials are set in .env — SEED_SUPER_ADMIN_EMAIL / SEED_SUPER_ADMIN_PASSWORD)`,
    );
  } catch (error: any) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
