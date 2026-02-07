import apiClient from "./api-client";
import { SalesSummary } from "@/types/sales";

export async function getSalesSummary() {
  return apiClient.get<SalesSummary>("/api/v1/sales/summary");
}

export async function getSalesList() {
  return apiClient.get<unknown[]>("/api/v1/sales");
}
