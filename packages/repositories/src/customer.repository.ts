import { Context, Effect, Layer } from "effect";
import { db } from "@opsync/db";
import { customers } from "@opsync/db/schema";
import { UnknownException } from "effect/Cause";

export interface CustomerRepository {
  list(): Effect.Effect<any[], unknown, never>;

  create(data: {
    name: string;
    phone?: string;
    email?: string;
  }): Effect.Effect<void, UnknownException, never>;
}

export const CustomerRepository =
  Context.GenericTag<CustomerRepository>("CustomerRepository");

export const CustomerRepositoryLive = Layer.succeed(
  CustomerRepository,
  CustomerRepository.of({
    list() {
      return Effect.tryPromise(async () => {
        return await db.select().from(customers);
      });
    },

    create(data) {
      return Effect.tryPromise(async () => {
        await db.insert(customers).values(data);
      });
    },
  })
);
