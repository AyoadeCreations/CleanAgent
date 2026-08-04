import { z } from "zod";
import { ApiError } from "@/lib/api";

export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    const message = first ? `${first.path.join(".")}: ${first.message}` : "Invalid input.";
    throw new ApiError("VALIDATION", 400, message);
  }
  return result.data;
}

export const evmAddressSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^0x[0-9a-f]{40}$/, "Enter a valid 0x-address.");

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

export const nameSchema = z.string().trim().min(1, "Name is required.").max(200);

export const nonceSchema = z.string().regex(/^[0-9a-f]{64}$/, "Invalid or missing nonce.");

export const signatureSchema = z.string().min(10, "Invalid signature.");

export const passwordSchema = z.string().min(6, "Password must be at least 6 characters.");

export const loginEmailSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const walletLoginSchema = z.object({
  walletAddress: evmAddressSchema,
  nonce: nonceSchema,
  signature: signatureSchema,
});

export const registerSchema = z.object({
  walletAddress: evmAddressSchema,
  nonce: nonceSchema,
  signature: signatureSchema,
  email: emailSchema.optional().or(z.literal("")),
  name: nameSchema.optional().or(z.literal("")),
  role: z.enum(["MERCHANT", "BUSINESS"]).optional(),
});

export const businessCreateSchema = z.object({
  name: nameSchema,
  description: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const agentCreateSchema = z.object({
  name: nameSchema,
  description: z.string().trim().max(400).optional().or(z.literal("")),
  walletAddress: evmAddressSchema.optional().or(z.literal("")),
  dailyLimit: z.number().nonnegative("Daily limit cannot be negative.").max(1e9),
  monthlyLimit: z.number().nonnegative("Monthly limit cannot be negative.").max(1e11),
});

export const agentUpdateSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().trim().max(400).optional(),
  dailyLimit: z.number().nonnegative().max(1e9).optional(),
  monthlyLimit: z.number().nonnegative().max(1e11).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "SUSPENDED", "DEACTIVATED"]).optional(),
});

export const transactionCreateSchema = z.object({
  receiver: evmAddressSchema,
  amount: z.number().positive("Amount must be a positive number.").max(1e12),
  assetType: z.string().trim().min(1).max(20),
  type: z.enum(["PAYMENT", "PAYROLL", "SUPPLIER", "ESCROW", "TREASURY"]).default("PAYMENT"),
  reference: z.string().trim().max(40).optional().or(z.literal("")),
  agentId: z.string().trim().max(64).optional().or(z.literal("")),
});

export const transactionActionSchema = z.object({
  action: z.enum(["SUSPEND", "RELEASE", "BLOCK", "APPROVE"]),
});

export const reportUpdateSchema = z.object({
  type: z.string().trim().min(1).max(40).optional(),
});