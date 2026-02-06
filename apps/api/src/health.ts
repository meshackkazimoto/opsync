import type { Context } from "hono";
import { success } from "./http/response";

export function healthHandler(c: Context) {
  return success(c, { status: "ok" });
}
