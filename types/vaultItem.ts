// schemas.ts
import { z } from "zod";

export const VaultItemSchema = z.object({
  id: z.string().uuid(), // UUID validation for `id`
  name: z.string(),
  username: z.string(),
  password: z.string(),
});

// Infer TypeScript type from the schema
export type VaultItem = z.infer<typeof VaultItemSchema>;
