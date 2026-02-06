import { Effect } from "effect";
import { EmployeeRepository } from "@opsync/repositories";
import type {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "./employee.dto";
import { runEffect } from "src/runtime";

export function listEmployeesController(c: any) {
  const effect = Effect.gen(function* () {
    const repo = yield* EmployeeRepository;
    return yield* repo.list();
  });

  return runEffect(c, effect);
}

export function getEmployeeController(c: any) {
  const id = c.req.param("id");

  const effect = Effect.gen(function* () {
    const repo = yield* EmployeeRepository;
    return yield* repo.getById(id);
  });

  return runEffect(c, effect);
}

export async function createEmployeeController(c: any) {
  const body = await c.req.json<CreateEmployeeRequest>();
  const auth = c.get("auth");

  const effect = Effect.gen(function* () {
    const repo = yield* EmployeeRepository;
    return yield* repo.create({
      ...body,
      createdBy: auth.userId,
    });
  });

  return runEffect(c, effect);
}

export async function updateEmployeeController(c: any) {
  const id = c.req.param("id");
  const body = await c.req.json<UpdateEmployeeRequest>();

  const effect = Effect.gen(function* () {
    const repo = yield* EmployeeRepository;
    return yield* repo.update(id, body);
  });

  return runEffect(c, effect);
}

export function deleteEmployeeController(c: any) {
  const id = c.req.param("id");

  const effect = Effect.gen(function* () {
    const repo = yield* EmployeeRepository;
    return yield* repo.delete(id);
  });

  return runEffect(c, effect);
}