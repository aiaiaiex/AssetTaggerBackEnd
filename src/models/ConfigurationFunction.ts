import z from "zod";

// Information returned by T-SQL configuration functions.
// https://learn.microsoft.com/en-us/sql/t-sql/functions/configuration-functions-transact-sql

export const ConfigurationInformationSchema = z.object({
  ServerName: z.string(),
});

export type ConfigurationInformation = z.infer<
  typeof ConfigurationInformationSchema
>;
