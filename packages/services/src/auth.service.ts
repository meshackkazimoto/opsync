import { Context, Effect, Layer } from "effect";
import { UnknownException } from "effect/Cause";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { UserRepository } from "@opsync/repositories";
import { RBACService } from "./rbac.service";
import type { Role } from "./rbac.service";

export type AuthResult = {
    userId: string;
    email: string;
    roles: Role[];
    permissions: string[];
    accessToken: string;
};

export interface AuthService {
    login(
        email: string,
        password: string
    ): Effect.Effect<AuthResult, UnknownException, never>;
}

export const AuthService = Context.GenericTag<AuthService>("AuthService");

export const AuthServiceLive = Layer.effect(
    AuthService,
    Effect.gen(function* () {
        const userRepo = yield* UserRepository;
        const rbac = yield* RBACService;

        return AuthService.of({
            login(email, password) {
          return Effect.gen(function* () {
              const user = yield* userRepo.findByEmail(email).pipe(
                  Effect.mapError((err) => new UnknownException(err))
              );

              if (!user) {
                  return yield* Effect.fail(
                      new UnknownException(new Error("Invalid credentials"))
                  );
              }

              const isValid = yield* Effect.tryPromise({
                  try: () => bcrypt.compare(password, user.password),
                  catch: (err) => new UnknownException(err),
              });

              if (!isValid) {
                  return yield* Effect.fail(
                      new UnknownException(new Error("Invalid credentials"))
                  );
              }

              const roles = user.roles as Role[];
              const permissions = yield* rbac.permissionsForRoles(roles).pipe(
                  Effect.mapError((err) => new UnknownException(err))
              );

              const token = yield* Effect.try({
                  try: () => jwt.sign(
                      {
                          sub: user.id,
                          roles,
                          permissions,
                      },
                      process.env.JWT_SECRET!,
                      { expiresIn: "1d" }
                  ),
                  catch: (err) => new UnknownException(err),
              });

              return {
                  userId: user.id,
                  email: user.email,
                  roles,
                  permissions,
                  accessToken: token,
              };
          });
      },

        });
    })
);
