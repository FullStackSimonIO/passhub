// schemas.ts
import { z } from "zod";

// Zod Schema for VaultItem
export const VaultItemSchema = z.object({
  id: z.string().uuid(), // Ensure it's a valid UUID
  name: z.string().min(1).max(100), // Non-empty name with max length
  username: z.string().email(), // Validate as a valid email
  password: z.string().min(8), // Enforce a minimum password length
});

// Infer TypeScript type from the schema
export type VaultItem = z.infer<typeof VaultItemSchema>;
