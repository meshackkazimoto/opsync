import { Context, Effect, Layer } from "effect";
import { db } from "@opsync/db";
import { userRoles, users } from "@opsync/db/schema";
import { eq } from "drizzle-orm";
import { UnknownException } from "effect/Cause";

export type UserWithRoles = {
  id: string;
  email: string;
  password: string;
  roles: string[];
};

export interface UserRepository {
  findByEmail(
    email: string
  ): Effect.Effect<UserWithRoles | null, unknown, never>;

  createAdmin(data: {
    id: string;
    email: string;
    passwordHash: string;
  }): Effect.Effect<void, UnknownException, never>;
}

export const UserRepository =
  Context.GenericTag<UserRepository>("UserRepository");

export const UserRepositoryLive = Layer.succeed(
  UserRepository,
  UserRepository.of({
    findByEmail(email) {
      return Effect.tryPromise(async () => {
        const rows = await db
          .select({
            id: users.id,
            email: users.email,
            role: userRoles.roleName,
            password: users.passwordHash,
          })
          .from(users)
          .leftJoin(userRoles, eq(users.id, userRoles.userId))
          .where(eq(users.email, email));

        if (rows.length === 0) return null;

        return {
          id: rows[0].id,
          email: rows[0].email,
          password: rows[0].password,
          roles: rows
            .map((r) => r.role)
            .filter((r): r is string => r !== null),
        };
      });
    },

    createAdmin({ id, email, passwordHash }) {
      return Effect.tryPromise(async () => {
        await db.insert(users).values({
          id,
          email,
          passwordHash,
        });
      });
    },
  })
);
