CREATE TABLE "departments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(100) NOT NULL,
  "description" varchar(255),
  "created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "idx_departments_name" ON "departments" ("name");

CREATE TABLE "employee_roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(100) NOT NULL,
  "description" varchar(255),
  "created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "idx_employee_roles_name" ON "employee_roles" ("name");
