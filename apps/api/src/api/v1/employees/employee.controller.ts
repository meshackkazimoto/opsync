import { Effect } from "effect";
import { EmployeeRepository } from "@opsync/repositories";
import { runEffect } from "../../../runtime";

export function listEmployeesController(c: any) {
  const effect = Effect.gen(function* () {
    const repo = yield* EmployeeRepository;
    return yield* repo.list();
  });

  return runEffect(c, effect);
}