import z from "zod";

export const RootSchema = z.object({
  databaseReachable: z.boolean(),
});

export type Root = z.infer<typeof RootSchema>;
