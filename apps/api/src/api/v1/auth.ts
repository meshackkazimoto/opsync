import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { sign } from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { loginSchema, refreshSchema, logoutSchema } from "@opsync/validation";
import { Roles } from "@opsync/config";
import type { Role } from "@opsync/config";
import { users, userRoles, refreshTokens } from "@opsync/db/schema";
import { db } from "../../db/client";
import { config } from "../../config/env";
import { permissionsForRoles } from "../../config/constants";
import { success } from "../../http/response";
import { UnauthorizedError, ValidationError } from "../../http/errors";
import { logger } from "@opsync/logger";

const roleSet = new Set(Object.values(Roles));

function parseBody<T>(schema: { safeParse: (input: unknown) => any }, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError("Validation failed", result.error.flatten());
  }
  return result.data as T;
}

async function getUserWithRoles(email: string) {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      role: userRoles.roleName,
    })
    .from(users)
    .leftJoin(userRoles, eq(users.id, userRoles.userId))
    .where(eq(users.email, email));

  if (rows.length === 0) return null;

  const roles = rows
    .map((row) => row.role)
    .filter((role): role is Role => !!role && roleSet.has(role as Role));

  return {
    id: rows[0].id,
    email: rows[0].email,
    passwordHash: rows[0].passwordHash,
    roles,
  };
}

async function getRolesForUser(userId: string): Promise<Role[]> {
  const rows = await db
    .select({ role: userRoles.roleName })
    .from(userRoles)
    .where(eq(userRoles.userId, userId));

  return rows
    .map((row) => row.role)
    .filter((role): role is Role => !!role && roleSet.has(role as Role));
}

export const authRoutes = new Hono();

authRoutes.post("/login", async (c) => {
  const body = parseBody<{ email: string; password: string }>(
    loginSchema,
    await c.req.json()
  );

  const user = await getUserWithRoles(body.email);

  if (!user) {
    logger.warn({ email: body.email }, "Auth login failed: user not found");
    throw new UnauthorizedError("Invalid credentials");
  }

  const isValid = await bcrypt.compare(body.password, user.passwordHash);

  if (!isValid) {
    logger.warn({ email: body.email }, "Auth login failed: invalid password");
    throw new UnauthorizedError("Invalid credentials");
  }

  const permissions = permissionsForRoles(user.roles);

  const accessToken = sign(
    {
      sub: user.id,
      roles: user.roles,
      permissions,
    },
    config.JWT_SECRET as Secret,
    { expiresIn: config.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"] }
  );

  const refreshToken = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.REFRESH_TOKEN_DAYS);

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt,
  });

  logger.info({ userId: user.id }, "Auth login success");

  return success(c, {
    userId: user.id,
    email: user.email,
    roles: user.roles,
    permissions,
    accessToken,
    refreshToken,
  });
});

authRoutes.post("/refresh", async (c) => {
  const body = parseBody<{ refreshToken: string }>(
    refreshSchema,
    await c.req.json()
  );

  const rows = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, body.refreshToken));

  const record = rows[0];

  if (!record) {
    logger.warn("Auth refresh failed: token not found");
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (record.revokedAt || new Date(record.expiresAt) < new Date()) {
    logger.warn({ refreshToken: record.token }, "Auth refresh failed: token invalid");
    throw new UnauthorizedError("Invalid refresh token");
  }

  const roles = await getRolesForUser(record.userId);
  const permissions = permissionsForRoles(roles);

  const accessToken = sign(
    {
      sub: record.userId,
      roles,
      permissions,
    },
    config.JWT_SECRET as Secret,
    { expiresIn: config.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"] }
  );

  logger.info({ userId: record.userId }, "Auth refresh success");

  return success(c, { accessToken });
});

authRoutes.post("/logout", async (c) => {
  const body = parseBody<{ refreshToken: string }>(
    logoutSchema,
    await c.req.json()
  );

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, body.refreshToken));

  logger.info("Auth logout success");

  return success(c, { ok: true });
});
