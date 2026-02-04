import { Hono } from "hono";
import { jwtMiddleware, type AuthVariables } from "../middleware/jwt.middleware";

export const meRoute = new Hono<{ Variables: AuthVariables }>();

meRoute.use(jwtMiddleware);

meRoute.get("/me", (c) => {
  const auth = c.get("auth");

  if (!auth) {
    return c.json({ success: false, message: "Invalid token" }, 401);
  }

  return c.json({
    success: true,
    data: auth,
  });
});
