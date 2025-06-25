import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  pin: text("pin").notNull(), // Will be hashed
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  loginAttempts: integer("login_attempts").notNull().default(0),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'deposit', 'withdraw', 'transfer_out', 'transfer_in', 'service', 'game', 'mobile_recharge'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  recipientUsername: text("recipient_username"), // For transfers
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  pin: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  description: true,
  recipientUsername: true,
  metadata: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  pin: z.string().length(4, "PIN debe tener 4 dígitos").regex(/^\d{4}$/, "PIN debe ser numérico"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPin: z.string().length(4, "PIN debe tener 4 dígitos"),
}).refine((data) => data.pin === data.confirmPin, {
  message: "Los PINs no coinciden",
  path: ["confirmPin"],
});

export const withdrawSchema = z.object({
  amount: z.number().min(10, "Monto mínimo $10").max(5000, "Monto máximo $5000"),
});

export const depositSchema = z.object({
  amount: z.number().min(10, "Monto mínimo $10").max(10000, "Monto máximo $10000"),
});

export const transferSchema = z.object({
  recipientUsername: z.string().min(1, "Usuario destinatario requerido"),
  amount: z.number().min(1, "Monto mínimo $1").max(10000, "Monto máximo $10000"),
  note: z.string().optional(),
});

export const changePinSchema = z.object({
  currentPin: z.string().length(4, "PIN actual debe tener 4 dígitos"),
  newPin: z.string().length(4, "PIN nuevo debe tener 4 dígitos").regex(/^\d{4}$/, "PIN debe ser numérico"),
  confirmPin: z.string().length(4, "Confirmación debe tener 4 dígitos"),
}).refine((data) => data.newPin === data.confirmPin, {
  message: "Los PINs no coinciden",
  path: ["confirmPin"],
});

export const mobileRechargeSchema = z.object({
  phoneNumber: z.string().min(10, "Número de teléfono inválido").max(15, "Número de teléfono inválido"),
  operator: z.enum(["movistar", "claro", "tigo", "virgin"]),
  amount: z.number().min(5, "Monto mínimo $5").max(100, "Monto máximo $100"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
