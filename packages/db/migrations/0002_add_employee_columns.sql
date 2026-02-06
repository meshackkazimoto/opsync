ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "email" varchar(255);
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "phone" varchar(20);
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "created_by" uuid;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now();
