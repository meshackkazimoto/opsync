DO $$ BEGIN
  CREATE TYPE "payment_method_enum" AS ENUM ('CASH', 'BANK', 'MOBILE_MONEY', 'CARD');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "purchase_order_status_enum" AS ENUM ('DRAFT', 'APPROVED', 'RECEIVED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TYPE "invoice_status_enum" ADD VALUE IF NOT EXISTS 'PARTIALLY_PAID';
  ALTER TYPE "invoice_status_enum" ADD VALUE IF NOT EXISTS 'VOID';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
UPDATE "invoices" SET "status" = 'PARTIALLY_PAID' WHERE "status" = 'PARTIAL';
--> statement-breakpoint
UPDATE "invoices" SET "status" = 'VOID' WHERE "status" = 'CANCELLED';
--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "invoice_number_seq" START 1;
--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "purchase_order_number_seq" START 1;
--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "name" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "name" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "suppliers" ALTER COLUMN "name" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "email" varchar(255);
--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "phone" varchar(20);
--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "address" varchar(500);
--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "created_by" uuid NOT NULL;
--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "invoice_number" varchar(30);
--> statement-breakpoint
UPDATE "invoices"
SET "invoice_number" = 'INV-' || to_char(coalesce("created_at", now()), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 6, '0')
WHERE "invoice_number" IS NULL;
--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "invoice_number" SET NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_invoices_number" ON "invoices" ("invoice_number");
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "method" TYPE "payment_method_enum" USING "method"::payment_method_enum;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(30) NOT NULL,
	"supplier_id" uuid NOT NULL,
	"status" purchase_order_status_enum DEFAULT 'DRAFT' NOT NULL,
	"order_date" date,
	"received_date" date,
	"notes" varchar(1000),
	"subtotal" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(14, 2) NOT NULL,
	"line_total" numeric(14, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expense_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255),
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "category_id" uuid;
--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;
--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "amount" TYPE numeric(14, 2);
--> statement-breakpoint
UPDATE "expenses" SET "description" = '' WHERE "description" IS NULL;
--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "description" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "category_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN IF EXISTS "category";
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customers_name" ON "customers" ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customers_email" ON "customers" ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customers_phone" ON "customers" ("phone");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_items_name" ON "items" ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_items_sku" ON "items" ("sku");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_customer" ON "invoices" ("customer_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_status" ON "invoices" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoices_issue_date" ON "invoices" ("issue_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoice_items_invoice" ON "invoice_items" ("invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_invoice_items_item" ON "invoice_items" ("item_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_invoice" ON "payments" ("invoice_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_payments_paid_at" ON "payments" ("paid_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_suppliers_name" ON "suppliers" ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_suppliers_email" ON "suppliers" ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_suppliers_phone" ON "suppliers" ("phone");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_purchase_orders_number" ON "purchase_orders" ("order_number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchase_orders_supplier" ON "purchase_orders" ("supplier_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchase_orders_status" ON "purchase_orders" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchase_orders_order_date" ON "purchase_orders" ("order_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_purchase_order_items_order" ON "purchase_order_items" ("purchase_order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_expense_categories_name" ON "expense_categories" ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_expenses_category" ON "expenses" ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_expenses_supplier" ON "expenses" ("supplier_id");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "customers" ADD CONSTRAINT "customers_created_by_users_fk"
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "items" ADD CONSTRAINT "items_created_by_users_fk"
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_fk"
    FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE restrict;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_fk"
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_fk"
    FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE cascade;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_item_fk"
    FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE restrict;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_fk"
    FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE cascade;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_fk"
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_created_by_fk"
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_fk"
    FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE restrict;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_fk"
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_order_fk"
    FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE cascade;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_created_by_fk"
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_fk"
    FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id") ON DELETE restrict;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "expenses" ADD CONSTRAINT "expenses_supplier_fk"
    FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE set null;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "expenses" ADD CONSTRAINT "expenses_employee_fk"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE set null;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_fk"
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE restrict;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
