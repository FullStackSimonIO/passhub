import { z } from "zod";

export const registerPayloadSchema = z.object({
  email: z.string().email(),
  password_hash: z.string().min(8).max(50), // ! Hashgröße anpassen
});

// Response Body Schema
export const registerResponseSchema = z.object({
  token: z.string(),
});

// Zod schema for validation
export const RegistrationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters long")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/\d/, "Password must include at least one number")
    .regex(
      /[@$!%*?&]/,
      "Password must include at least one special character (@, $, !, %, *, ?, &)"
    ),
});

// Types
export type RegisterPayload = z.infer<typeof registerPayloadSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
