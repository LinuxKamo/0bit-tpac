/**
 * Self-contained database migration + seed runner.
 *
 * Runs automatically on every API startup (called from server.ts).
 * Uses raw pg — NOT Prisma — so it works with the transaction-mode pooler
 * (pgbouncer=true) without needing a direct database connection.
 *
 * Every statement is idempotent:
 *   CREATE TABLE IF NOT EXISTS
 *   ALTER TABLE ... ADD COLUMN IF NOT EXISTS
 *   CREATE INDEX IF NOT EXISTS
 *   INSERT ... ON CONFLICT DO NOTHING
 *
 * This means it is safe to run on every restart — existing data is never touched.
 */

import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

export async function runMigrationsAndSeed(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("⚠️  [MIGRATE] DATABASE_URL not set — skipping migrations");
    return;
  }

  const pool   = new pg.Pool({ connectionString, max: 1, idleTimeoutMillis: 10_000 });
  const client = await pool.connect();

  try {
    console.log("🔄 [MIGRATE] Running startup migrations...");

    // ── Enums ────────────────────────────────────────────────────────────────
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CORPORATE_ADMIN', 'MENTOR', 'MEMBER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    // Add new Role values for databases that already have the old USER-based enum
    await client.query(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CORPORATE_ADMIN';`);
    await client.query(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MENTOR';`);
    await client.query(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MEMBER';`);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "RegistrationMode" AS ENUM ('INVITE_ONLY', 'SELF_REGISTER', 'SELF_REGISTER_AUTO');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    // ── Tables ───────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id"                   TEXT          NOT NULL,
        "email"                TEXT          NOT NULL,
        "password"             TEXT          NOT NULL,
        "role"                 "Role"        NOT NULL DEFAULT 'MEMBER',
        "accountStatus"        "AccountStatus" NOT NULL DEFAULT 'PENDING',
        "firstName"            TEXT,
        "lastName"             TEXT,
        "displayName"          TEXT,
        "avatarUrl"            TEXT,
        "phone"                TEXT,
        "verificationCode"     TEXT,
        "verificationExpires"  TIMESTAMP(3),
        "passwordResetToken"   TEXT,
        "passwordResetExpires" TIMESTAMP(3),
        "lastActiveAt"         TIMESTAMP(3),
        "city"                 TEXT,
        "country"              TEXT,
        "language"             TEXT,
        "dateOfBirth"          TIMESTAMP(3),
        "googleId"             TEXT,
        "googleRefreshToken"   TEXT,
        "invitedById"          TEXT,
        "bio"                  TEXT,
        "countryId"            TEXT,
        "organisationId"       TEXT,
        "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id"         TEXT NOT NULL,
        "userId"     TEXT NOT NULL,
        "action"     TEXT NOT NULL,
        "countryId"  TEXT,
        "entityType" TEXT,
        "entityId"   TEXT,
        "oldValue"   JSONB,
        "newValue"   JSONB,
        "meta"       JSONB,
        "ip"         TEXT,
        "userAgent"  TEXT,
        "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
      );
    `);
    // Add columns for databases created before these fields were added
    await client.query(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "countryId"  TEXT;`);
    await client.query(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "entityType" TEXT;`);
    await client.query(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "entityId"   TEXT;`);
    await client.query(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "oldValue"   JSONB;`);
    await client.query(`ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "newValue"   JSONB;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id"        TEXT    NOT NULL,
        "userId"    TEXT    NOT NULL,
        "title"     TEXT    NOT NULL,
        "body"      TEXT    NOT NULL,
        "read"      BOOLEAN NOT NULL DEFAULT false,
        "link"      TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "SystemSetting" (
        "id"        TEXT NOT NULL,
        "key"       TEXT NOT NULL,
        "value"     TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Country" (
        "id"                    TEXT    NOT NULL,
        "name"                  TEXT    NOT NULL,
        "code"                  TEXT    NOT NULL,
        "flagEmoji"             TEXT,
        "currency"              TEXT    NOT NULL,
        "currencySymbol"        TEXT,
        "timezone"              TEXT    NOT NULL,
        "status"                TEXT    NOT NULL DEFAULT 'DRAFT',
        "physicalAccessEnabled" BOOLEAN NOT NULL DEFAULT false,
        "physicalLocation"      TEXT,
        "physicalAddress"       TEXT,
        "paymentGateway"        TEXT,
        "paymentConfigJson"     JSONB,
        "chapterName"           TEXT,
        "chapterLeadId"         TEXT,
        "showGlobalContent"     BOOLEAN NOT NULL DEFAULT true,
        "complianceFramework"   TEXT,
        "taxConfigJson"         JSONB,
        "invoiceTemplateId"     TEXT,
        "waitlistMessage"       TEXT,
        "onboardingMessage"     TEXT,
        "registrationMode"      TEXT    NOT NULL DEFAULT 'INVITE_ONLY',
        "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "CountryTier" (
        "id"               TEXT    NOT NULL,
        "countryId"        TEXT    NOT NULL,
        "slot"             TEXT    NOT NULL,
        "name"             TEXT    NOT NULL,
        "description"      TEXT,
        "price"            DECIMAL(10,2) NOT NULL,
        "billingCycle"     TEXT    NOT NULL DEFAULT 'monthly',
        "isActive"         BOOLEAN NOT NULL DEFAULT true,
        "isRecommended"    BOOLEAN NOT NULL DEFAULT false,
        "sortOrder"        INTEGER NOT NULL DEFAULT 0,
        "featuresJson"     JSONB,
        "guestDaysPerMonth" INTEGER,
        "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CountryTier_pkey" PRIMARY KEY ("id")
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "CountryManager" (
        "id"        TEXT NOT NULL,
        "countryId" TEXT NOT NULL,
        "userId"    TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CountryManager_pkey" PRIMARY KEY ("id")
      );
    `);

    // ── Idempotent column additions (for databases created before these fields) ─
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "city"           TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "country"        TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "language"       TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dateOfBirth"    TIMESTAMP(3);`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone"          TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio"            TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "countryId"      TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "organisationId" TEXT;`);

    // ── Indexes ──────────────────────────────────────────────────────────────
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key"    ON "User"("email");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "User_email_idx"    ON "User"("email");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "User_role_idx"     ON "User"("role");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "User_googleId_idx" ON "User"("googleId");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "Country_code_key"        ON "Country"("code");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "Country_status_idx"      ON "Country"("status");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "CountryTier_countryId_idx" ON "CountryTier"("countryId");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "CountryTier_countryId_slot_key" ON "CountryTier"("countryId","slot");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "CountryManager_countryId_idx" ON "CountryManager"("countryId");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "CountryManager_userId_idx"    ON "CountryManager"("userId");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "CountryManager_countryId_userId_key" ON "CountryManager"("countryId","userId");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "User_countryId_idx"      ON "User"("countryId");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "AuditLog_userId_idx"   ON "AuditLog"("userId");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");`);
    await client.query(`CREATE INDEX        IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "SystemSetting_key_key" ON "SystemSetting"("key");`);

    // ── Foreign keys (safe to re-run — DO block catches duplicate) ───────────
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "User" ADD CONSTRAINT "User_invitedById_fkey"
          FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    console.log("✅ [MIGRATE] Schema ready");

    // ── Seed system settings ─────────────────────────────────────────────────
    await client.query(`
      INSERT INTO "SystemSetting" ("id", "key", "value", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'registration_mode', 'INVITE_ONLY', NOW(), NOW())
      ON CONFLICT ("key") DO NOTHING;
    `);
    await client.query(`
      INSERT INTO "SystemSetting" ("id", "key", "value", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, 'app_name', 'My App', NOW(), NOW())
      ON CONFLICT ("key") DO NOTHING;
    `);

    // ── Seed super admin (only if no super admin exists) ─────────────────────
    const existing = await client.query(
      `SELECT id FROM "User" WHERE role = 'SUPER_ADMIN' LIMIT 1`
    );
    if (existing.rowCount === 0) {
      const seedEmail    = process.env.SEED_SUPER_ADMIN_EMAIL    || "superadmin@example.com";
      const seedPassword = process.env.SEED_SUPER_ADMIN_PASSWORD || "SuperAdmin123!";
      const passwordHash = await bcrypt.hash(seedPassword, 12);
      const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      await client.query(`
        INSERT INTO "User" (
          "id", "email", "password", "role", "accountStatus",
          "firstName", "lastName", "displayName", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, 'SUPER_ADMIN', 'ACTIVE', 'Super', 'Admin', 'Super Admin', NOW(), NOW())
        ON CONFLICT ("email") DO NOTHING;
      `, [id, seedEmail, passwordHash]);
      console.log(`🌱 [MIGRATE] Super admin created  →  ${seedEmail} / [from SEED_SUPER_ADMIN_PASSWORD]`);
    } else {
      console.log("🌱 [MIGRATE] Super admin already exists — skipping seed");
    }

  } catch (err: any) {
    console.error("❌ [MIGRATE] Migration failed:", err.message);
    throw err; // re-throw so server startup aborts — don't run a broken app
  } finally {
    client.release();
    await pool.end();
  }
}
