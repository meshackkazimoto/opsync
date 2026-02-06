import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5055),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().min(1).default("15m"),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().positive().default(14),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.flatten();
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(formatted.fieldErrors)}`
  );
}

export type Config = z.infer<typeof envSchema>;

export const config: Config = parsed.data;
