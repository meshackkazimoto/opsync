import { Effect } from "effect";
import { AuthService } from "@opsync/services";
import { runEffect } from "../../../runtime";
import { ok } from "../../../common/response";

export async function loginController(c: any) {
  const body = await c.req.json();

  const effect = Effect.gen(function* () {
    const auth = yield* AuthService;
    return yield* auth.login(body.email, body.password);
  });

  return runEffect(c, effect);
}