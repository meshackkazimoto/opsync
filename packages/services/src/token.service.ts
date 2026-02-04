import { Context, Effect, Layer } from "effect";
import { UnknownException } from "effect/Cause";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { RefreshTokenRepository } from "@opsync/repositories";

export type IssuedTokens = {
  accessToken: string;
  refreshToken: string;
};

export interface TokenService {
  issueTokens(data: {
    userId: string;
    roles: string[];
    permissions: string[];
  }): Effect.Effect<IssuedTokens, UnknownException, never>;

  refreshAccessToken(
    refreshToken: string
  ): Effect.Effect<{ accessToken: string }, UnknownException, never>;

  revokeRefreshToken(
    refreshToken: string
  ): Effect.Effect<void, UnknownException, never>;
}

export const TokenService =
  Context.GenericTag<TokenService>("TokenService");

export const TokenServiceLive = Layer.effect(
  TokenService,
  Effect.gen(function* () {
    const refreshTokenRepo = yield* RefreshTokenRepository;

    return TokenService.of({
      issueTokens({ userId, roles, permissions }) {
        return Effect.gen(function* () {
          const accessToken = yield* Effect.try({
            try: () =>
              jwt.sign(
                { sub: userId, roles, permissions },
                process.env.JWT_SECRET!,
                { expiresIn: "15m" }
              ),
            catch: (err) => new UnknownException(err),
          });

          const refreshToken = crypto.randomUUID();

          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 14);

          yield* refreshTokenRepo.save({
            userId,
            token: refreshToken,
            expiresAt,
          }).pipe(
            Effect.mapError((err) => new UnknownException(err))
          );

          return {
            accessToken,
            refreshToken,
          };
        });
      },
      
      refreshAccessToken(refreshToken) {
        return Effect.gen(function* () {
          const stored = yield* refreshTokenRepo.findValid(refreshToken).pipe(
            Effect.mapError((err) => new UnknownException(err))
          );

          if (!stored) {
            return yield* Effect.fail(
              new UnknownException(new Error("Invalid refresh token"))
            );
          }

          const accessToken = yield* Effect.try({
            try: () =>
              jwt.sign(
                { sub: stored.userId },
                process.env.JWT_SECRET!,
                { expiresIn: "15m" }
              ),
            catch: (err) => new UnknownException(err),
          });

          return { accessToken };
        });
      },

      revokeRefreshToken(refreshToken) {
        return refreshTokenRepo
          .revoke(refreshToken)
          .pipe(
            Effect.mapError((err) => new UnknownException(err))
          );
      },
    });
  })
);