import { Cause, Effect, Exit, Layer, Option } from "effect";
import type { Context as HonoContext } from "hono";

import {
  AuthServiceLive,
  RBACServiceLive,
  TokenServiceLive,
} from "@opsync/services";
import type { AuthService, RBACService, TokenService } from "@opsync/services";

import {
  EmployeeRepositoryLive,
  RefreshTokenRepositoryLive,
  UserRepositoryLive,
} from "@opsync/repositories";
import type {
  EmployeeRepository,
  RefreshTokenRepository,
  UserRepository,
} from "@opsync/repositories";

const BaseLayer = Layer.mergeAll(
  UserRepositoryLive,
  RBACServiceLive,
  RefreshTokenRepositoryLive
);

const RepositoryLayer = Layer.mergeAll(
  BaseLayer,
  EmployeeRepositoryLive
);

const AppLayer = Layer.mergeAll(
  RepositoryLayer,
  Layer.provide(AuthServiceLive, BaseLayer),
  Layer.provide(TokenServiceLive, BaseLayer)
);

type AppContext =
  | UserRepository
  | RBACService
  | AuthService
  | EmployeeRepository
  | RefreshTokenRepository
  | TokenService;

export async function runEffect<A, E>(
  c: HonoContext,
  effect: Effect.Effect<A, E, AppContext>
) {
  const exit = await Effect.runPromiseExit(
    Effect.provide(effect, AppLayer)
  );

  return Exit.match(exit, {
    onSuccess: (value) =>
      c.json(
        {
          success: true,
          data: value,
        },
        200
      ),
    onFailure: (cause) => {
      console.error(Cause.pretty(cause));
      const toMessage = (value: unknown): string => {
        if (typeof value === "string") return value;
        if (value instanceof Error) return value.message;
        if (value && typeof value === "object") {
          const record = value as { message?: unknown };
          if (typeof record.message === "string") {
            return record.message;
          }
        }
        return "Internal server error";
      };

      const message = Option.match(Cause.failureOption(cause), {
        onNone: () => "Internal server error",
        onSome: (error) => {
          if (Cause.isUnknownException(error)) {
            return toMessage(error.error);
          }
          if (error instanceof Error) {
            if (error.cause !== undefined) {
              return toMessage(error.cause);
            }
            return error.message;
          }
          return toMessage(error);
        },
      });

      return c.json(
        {
          success: false,
          message,
        },
        401
      );
    },
  });
}
