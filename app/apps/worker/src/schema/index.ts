import z from "zod";

const itemSchema = z.object({
  productId: z.string().min(24).max(24),
  quantity: z.number().int().min(1),
});

export const orderSchema = z.object({
  orderId: z.string().min(24).max(24),
  items: z.object({
    location: z.string(),
    totalAmount: z.number().positive(),
    items: z.array(itemSchema),
  }),
});
