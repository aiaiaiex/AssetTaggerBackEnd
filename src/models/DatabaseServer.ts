import z from "zod";

export const DatabaseServerSchema = z.object({
  // https://learn.microsoft.com/en-us/sql/t-sql/functions/servername-transact-sql
  ServerName: z.string(),
});

export type DatabaseServer = z.infer<typeof DatabaseServerSchema>;
