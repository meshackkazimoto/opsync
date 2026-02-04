import { Context, Effect, Layer } from "effect";
import { db } from "@opsync/db";
import { purchases } from "@opsync/db/schema";
import { UnknownException } from "effect/Cause";

export interface PurchaseRepository {
  list(): Effect.Effect<any[], unknown, never>;

  create(data: {
    supplierId: string;
    amount: string;
    status: string;
  }): Effect.Effect<void, UnknownException, never>;
}

export const PurchaseRepository =
  Context.GenericTag<PurchaseRepository>("PurchaseRepository");

export const PurchaseRepositoryLive = Layer.succeed(
  PurchaseRepository,
  PurchaseRepository.of({
    list() {
      return Effect.tryPromise(async () => {
        return await db.select().from(purchases);
      });
    },

    create(data: any) {
      return Effect.tryPromise(async () => {
        await db.insert(purchases).values(data);
      });
    },
  })
);
