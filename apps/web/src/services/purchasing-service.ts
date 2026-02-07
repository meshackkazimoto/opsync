import apiClient from "./api-client";
import { PurchaseOrder } from "@/types/purchasing";

export async function getPurchaseOrders() {
  return apiClient.get<PurchaseOrder[]>("/api/v1/purchasing/purchase-orders");
}
