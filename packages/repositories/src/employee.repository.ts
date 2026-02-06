import { Context, Effect, Layer } from "effect";
import { db } from "@opsync/db";
import { employees } from "@opsync/db/schema";
import { UnknownException } from "effect/Cause";
import { eq } from "drizzle-orm";

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  department: string | null;
  position: string | null;
};

export interface EmployeeRepository {
  list(): Effect.Effect<any[], unknown, never>;

  create(data: {
    firstName: string;
    lastName: string;
    department?: string;
    position?: string;
  }): Effect.Effect<void, UnknownException, never>;
  
  getById(id: string): Effect.Effect<any | null, Error, never>;
  update(id: string, data: any): Effect.Effect<void, Error, never>;
  delete(id: string): Effect.Effect<void, Error, never>;
}

export const EmployeeRepository =
  Context.GenericTag<EmployeeRepository>("EmployeeRepository");

export const EmployeeRepositoryLive = Layer.succeed(
  EmployeeRepository,
  EmployeeRepository.of({
    list() {
      return Effect.tryPromise(async () => {
        return await db.select().from(employees);
      });
    },

    create(data) {
      return Effect.tryPromise(async () => {
        await db.insert(employees).values(data);
      });
    },
    
    async getById(id: string): Promise<any> {
      try {
        const result = await db.select().from(employees)
          .where(eq(employees.id, id))
          .execute();
        
        return result;
      } catch (error) {
        throw new Error(`Error getting employee with id ${id}: ${error}`);
      }
    },
  })
);
