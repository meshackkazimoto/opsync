import { Effect } from "effect";
import { EmployeeRepository } from "@opsync/repositories";
import { runEffect } from "../../../runtime";
import { Context } from "hono";

export function listEmployeesController(c: Context) {
  const effect = Effect.gen(function* () {
    const repo = yield* EmployeeRepository;
    return yield* repo.list();
  });

  return runEffect(c, effect);
}