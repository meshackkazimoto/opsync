import { Effect } from "effect";
import { Hono } from "hono";
import { AuthService } from "@opsync/services";
import { runEffect } from "src/runtime";

type LoginRequest = {
  email: string;
  password: string;
}

const authRoute = new Hono();

authRoute.post("/", async (c) => {
  const body = await c.req.json<LoginRequest>();
  
  const effect = Effect.gen(function* () {
    const auth = yield* AuthService;
    return yield* auth.login(body.email, body.password);
  });
  
  return runEffect(c, effect);
});

export default authRoute;
