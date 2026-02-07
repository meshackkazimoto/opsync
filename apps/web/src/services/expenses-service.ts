import apiClient from "./api-client";
import { ExpenseRecord } from "@/types/expenses";

export async function getExpenses() {
  return apiClient.get<ExpenseRecord[]>("/api/v1/expenses");
}
