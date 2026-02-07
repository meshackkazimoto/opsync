import { z } from "zod";
import { uuidSchema } from "./common";
import { moneySchema } from "./sales";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const createSupplierSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(3).optional(),
  address: z.string().min(1).optional(),
  contact: z.string().min(1).optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const purchaseOrderItemSchema = z.object({
  itemName: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  unitPrice: moneySchema.positive(),
});

export const createPurchaseOrderSchema = z.object({
  supplierId: uuidSchema,
  orderDate: dateSchema.optional(),
  notes: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1),
});

export const updatePurchaseOrderSchema = z.object({
  supplierId: uuidSchema.optional(),
  orderDate: dateSchema.optional(),
  notes: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1).optional(),
});
