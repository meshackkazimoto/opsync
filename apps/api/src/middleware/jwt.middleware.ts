import { createMiddleware } from "hono/factory";
import jwt, { VerifyOptions } from "jsonwebtoken";

export type AuthContext = {
  userId: string;
  roles: string[];
  permissions: string[];
};

export type AuthVariables = {
  auth: AuthContext;
};

export const jwtMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({
      success: false,
      message: "Invalid token",
    }, 401);
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!,
      {} as VerifyOptions
    ) as AuthContext;

    c.set("auth", payload);

    await next();
  } catch {
    return c.json({ message: "Invalid token" }, 401);
  }
});
