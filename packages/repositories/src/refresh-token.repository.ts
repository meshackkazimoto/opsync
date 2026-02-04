import { db } from "@opsync/db";
import { refreshTokens } from "@opsync/db/schema";
import { eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";

export interface RefreshTokenRepository {
  save(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Effect.Effect<void, Error, never>;
  findValid(token: string): Effect.Effect<any | null, Error, never>;
  revoke(token: string): Effect.Effect<void, Error, never>;
}

export const RefreshTokenRepository =
  Context.GenericTag<RefreshTokenRepository>("RefreshTokenRepository");

export const RefreshTokenRepositoryLive = Layer.succeed(
  RefreshTokenRepository,
  RefreshTokenRepository.of({
    save(data) {
      return Effect.tryPromise(async () => {
        await db.insert(refreshTokens).values(data);
      });
    },

    findValid(token) {
      return Effect.tryPromise(async () => {
        const rows = await db
          .select()
          .from(refreshTokens)
          .where(eq(refreshTokens.token, token));

        const record = rows[0];
        if (!record) return null;
        if (record.revokedAt) return null;
        if (new Date(record.expiresAt) < new Date()) return null;

        return record;
      });
    },

    revoke(token) {
      return Effect.tryPromise(async () => {
        await db
          .update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(eq(refreshTokens.token, token));
      });
    },
  })
);
