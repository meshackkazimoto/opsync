CREATE TYPE "public"."employee_status_enum" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."invoice_status_enum" AS ENUM('DRAFT', 'ISSUED', 'PAID', 'PARTIAL', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."purchase_status_enum" AS ENUM('PENDING', 'RECEIVED', 'PAID', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."role_enum" AS ENUM('ADMIN', 'HR', 'SALES', 'PROCUREMENT', 'VIEWER');--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"public"."employee_status_enum";--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "status" SET DATA TYPE "public"."employee_status_enum" USING "status"::"public"."employee_status_enum";--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "name" SET DATA TYPE "public"."role_enum" USING "name"::"public"."role_enum";--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "status" SET DATA TYPE "public"."invoice_status_enum" USING "status"::"public"."invoice_status_enum";--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "status" SET DATA TYPE "public"."purchase_status_enum" USING "status"::"public"."purchase_status_enum";--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_attendance" ON "attendance" USING btree ("employee_id","date");--> statement-breakpoint
CREATE INDEX "idx_expenses_date" ON "expenses" USING btree ("expense_date");--> statement-breakpoint
CREATE INDEX "idx_expenses_category" ON "expenses" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_invoices_customer" ON "invoices" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_invoices_status" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_purchases_supplier" ON "purchases" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_purchases_status" ON "purchases" USING btree ("status");