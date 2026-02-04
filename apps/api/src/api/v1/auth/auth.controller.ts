import { Effect } from "effect";
import type { Context } from "hono";
import { AuthService, TokenService } from "@opsync/services";
import { runEffect } from "../../../runtime";

export async function loginController(c: Context) {
  const body = await c.req.json();

  const effect = Effect.gen(function* () {
    const auth = yield* AuthService;
    return yield* auth.login(body.email, body.password);
  });

  return runEffect(c, effect);
}

export async function refreshController(c: Context) {
  const body = await c.req.json();

  const effect = Effect.gen(function* () {
    const tokenService = yield* TokenService;
    return yield* tokenService.refreshAccessToken(body.refreshToken);
  });

  return runEffect(c, effect);
}
