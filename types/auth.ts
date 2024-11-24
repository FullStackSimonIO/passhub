import { z } from "zod";

export const registerPayloadSchema = z.object({
  email: z.string().email(),
  password_hash: z.string().min(8).max(50), // ! Hashgröße anpassen
});

// Response Body Schema
export const registerResponseSchema = z.object({
  token: z.string(),
});

// Types
export type RegisterPayload = z.infer<typeof registerPayloadSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
