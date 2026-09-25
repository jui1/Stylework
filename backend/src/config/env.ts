import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().startsWith("postgresql://"),
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:5173")
    .refine((value) => {
      return value.split(",").every((origin) => {
        try {
          const url = new URL(origin.trim());
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      });
    }, "CORS_ORIGIN must be a comma-separated list of http(s) origins"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  WEBHOOK_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  WEBHOOK_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const details = JSON.stringify(parsed.error.flatten().fieldErrors);
    throw new Error(`Invalid environment variables: ${details}`);
  }

  return parsed.data;
}

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
