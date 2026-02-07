import { z } from "zod";
import { uuidSchema } from "./common";

export const moneySchema = z.coerce.number().finite().nonnegative();
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(3).optional(),
  address: z.string().min(1).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const createItemSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1).optional(),
  unitPrice: moneySchema,
  isService: z.boolean().default(false),
});

export const updateItemSchema = createItemSchema.partial();

export const invoiceItemInputSchema = z.object({
  itemId: uuidSchema,
  quantity: z.coerce.number().int().positive(),
  unitPrice: moneySchema.optional(),
});

export const createInvoiceSchema = z.object({
  customerId: uuidSchema,
  dueDate: dateSchema.optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemInputSchema).min(1),
});

export const updateInvoiceSchema = z.object({
  dueDate: dateSchema.optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemInputSchema).min(1).optional(),
});

export const createPaymentSchema = z.object({
  amount: moneySchema.positive(),
  method: z.enum(["CASH", "BANK", "MOBILE_MONEY", "CARD"]).default("CASH"),
  paidAt: dateSchema.optional(),
  reference: z.string().optional(),
});
