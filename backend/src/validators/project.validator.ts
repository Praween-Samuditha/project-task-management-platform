import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED"]).default("ACTIVE"),
});

export const updateProjectSchema = createProjectSchema.partial();
