import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
},
  (t) => ({
    emailIdx: index('idx_users_email').on(t.email)
  })
);