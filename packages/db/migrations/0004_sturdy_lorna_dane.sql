CREATE TYPE "public"."payment_method_enum" AS ENUM('CASH', 'BANK', 'MOBILE_MONEY', 'CARD');--> statement-breakpoint
CREATE TYPE "public"."purchase_order_status_enum" AS ENUM('DRAFT', 'APPROVED', 'RECEIVED', 'CANCELLED');--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "invoice_number_seq" START 1;
--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "purchase_order_number_seq" START 1;
--> statement-breakpoint
CREATE TABLE "expense_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255),
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(30) NOT NULL,
	"supplier_id" uuid NOT NULL,
	"status" "purchase_order_status_enum" DEFAULT 'DRAFT' NOT NULL,
	"order_date" date,
	"received_date" date,
	"notes" varchar(1000),
	"subtotal" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"item_name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(14, 2) NOT NULL,
	"line_total" numeric(14, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expenses" RENAME COLUMN "category" TO "category_name";--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
UPDATE "invoices" SET "status" = 'PARTIALLY_PAID' WHERE "status" = 'PARTIAL';--> statement-breakpoint
UPDATE "invoices" SET "status" = 'VOID' WHERE "status" = 'CANCELLED';--> statement-breakpoint
DROP TYPE "public"."invoice_status_enum";--> statement-breakpoint
CREATE TYPE "public"."invoice_status_enum" AS ENUM('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'VOID');--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "status" SET DATA TYPE "public"."invoice_status_enum" USING "status"::"public"."invoice_status_enum";--> statement-breakpoint
DROP INDEX "idx_expenses_category";--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "amount" SET DATA TYPE numeric(14, 2);--> statement-breakpoint
ALTER TABLE "suppliers" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "method" SET DATA TYPE "public"."payment_method_enum" USING "method"::"public"."payment_method_enum";--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "invoice_number" varchar(30);--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "address" varchar(500);--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
WITH admin_user AS (
  SELECT id FROM "users" ORDER BY "created_at" NULLS LAST LIMIT 1
),
distinct_categories AS (
  SELECT DISTINCT "category_name" AS name FROM "expenses" WHERE "category_name" IS NOT NULL
)
INSERT INTO "expense_categories" ("id", "name", "created_by")
SELECT gen_random_uuid(), dc.name, au.id
FROM distinct_categories dc
CROSS JOIN admin_user au
WHERE NOT EXISTS (
  SELECT 1 FROM "expense_categories" ec WHERE ec."name" = dc."name"
);--> statement-breakpoint
UPDATE "expenses" e
SET "category_id" = ec.id
FROM "expense_categories" ec
WHERE e."category_name" = ec."name" AND e."category_id" IS NULL;--> statement-breakpoint
UPDATE "suppliers"
SET "created_by" = (SELECT id FROM "users" ORDER BY "created_at" NULLS LAST LIMIT 1)
WHERE "created_by" IS NULL;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "category_name";--> statement-breakpoint
ALTER TABLE "suppliers" ALTER COLUMN "created_by" SET NOT NULL;--> statement-breakpoint
UPDATE "invoices"
SET "invoice_number" = 'INV-' || to_char(coalesce("created_at", now()), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 6, '0')
WHERE "invoice_number" IS NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "invoice_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_expense_categories_name" ON "expense_categories" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_purchase_orders_number" ON "purchase_orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "idx_purchase_orders_supplier" ON "purchase_orders" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_purchase_orders_status" ON "purchase_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_purchase_orders_order_date" ON "purchase_orders" USING btree ("order_date");--> statement-breakpoint
CREATE INDEX "idx_purchase_order_items_order" ON "purchase_order_items" USING btree ("purchase_order_id");--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_customers_name" ON "customers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_customers_email" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_customers_phone" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_expenses_supplier" ON "expenses" USING btree ("supplier_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_invoices_number" ON "invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "idx_invoices_issue_date" ON "invoices" USING btree ("issue_date");--> statement-breakpoint
CREATE INDEX "idx_suppliers_name" ON "suppliers" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_suppliers_email" ON "suppliers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_suppliers_phone" ON "suppliers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_invoice_items_invoice" ON "invoice_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_items_item" ON "invoice_items" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "idx_payments_invoice" ON "payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_payments_paid_at" ON "payments" USING btree ("paid_at");--> statement-breakpoint
CREATE INDEX "idx_items_name" ON "items" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_items_sku" ON "items" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "idx_expenses_category" ON "expenses" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "amount";
