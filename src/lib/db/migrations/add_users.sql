-- Add users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "username" VARCHAR(100) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "auto_sync" BOOLEAN DEFAULT true NOT NULL,
  "last_login" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add sessions table
CREATE TABLE IF NOT EXISTS "sessions" (
  "id" VARCHAR(255) PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add user_id to shops table
ALTER TABLE "shops" ADD COLUMN IF NOT EXISTS "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE;

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_idx" ON "users"("username");
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");
CREATE INDEX IF NOT EXISTS "sessions_expires_at_idx" ON "sessions"("expires_at");
CREATE INDEX IF NOT EXISTS "shops_user_id_idx" ON "shops"("user_id");

-- Update existing shops to have a default user (you'll need to create one first)
-- INSERT INTO "users" (email, username, password_hash) VALUES ('admin@example.com', 'admin', '$2a$10$...');
-- UPDATE "shops" SET "user_id" = 1 WHERE "user_id" IS NULL;
