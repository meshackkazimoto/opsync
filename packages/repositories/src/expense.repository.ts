import { Context, Effect } from "effect";
import { db } from "@opsync/db";
import { expenses } from "@opsync/db/schema";
import { UnknownException } from "effect/Cause";
import { between } from "drizzle-orm";

export type Expense = {
  id: string;
  category: string;
  amount: string;
  expenseDate: string;
};

export interface ExpenseRepository {
  create(data: {
    category: string;
    description?: string;
    amount: string;
    expenseDate: string;
    createdBy: string;
  }): Effect.Effect<void, UnknownException, never>;

  listByDateRange(
    from: string,
    to: string
  ): Effect.Effect<Expense[], unknown, never>;
}

export const ExpenseRepository =
  Context.GenericTag<ExpenseRepository>("ExpenseRepository");

export const ExpenseRepositoryLive = Effect.succeed<ExpenseRepository>({
  create(data) {
    return Effect.tryPromise(async () => {
      await db.insert(expenses).values(data);
    });
  },

  listByDateRange(from, to) {
    return Effect.tryPromise(async () => {
      return await db
        .select()
        .from(expenses)
        .where(between(expenses.expenseDate, from, to));
    });
  },
});