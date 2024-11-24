import { z } from "zod";

export const healthResponseSchema = z.object({
  status: z.string(),
  uptime: z.number(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
