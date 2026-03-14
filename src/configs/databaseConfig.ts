import z from "zod";

import { zodParseNumber, zodSubstituteEmptyString } from "../utils/zodUtils";

const DatabaseConfigOptionsSchema = z.object({
  encrypt: z.stringbool({
    case: "sensitive",
    falsy: ["false"],
    truthy: ["true", ""], // Empty string defaults to true.
  }),
  trustServerCertificate: z.stringbool({
    case: "sensitive",
    falsy: ["false", ""], // Empty string defaults to false.
    truthy: ["true"],
  }),
});

const DatabaseConfigSchema = z.object({
  database: z.string().min(1),
  options: DatabaseConfigOptionsSchema,
  password: z.string(),
  // 0 <= port <= 65535
  // See more:
  // https://datatracker.ietf.org/doc/html/rfc6335#section-6
  port: zodParseNumber(z.int().min(0).max(65535), 1433), // Empty string defaults to 1433.
  server: zodSubstituteEmptyString(z.string().min(1), "localhost"), // Empty string defaults to localhost.
  user: z.string().min(1),
});

type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;

const databaseConfig: DatabaseConfig = DatabaseConfigSchema.parse({
  database: process.env.DATABASE_NAME,
  options: {
    encrypt: process.env.DATABASE_ENCRYPT,
    trustServerCertificate: process.env.DATABASE_TRUST_SERVER_CERTIFICATE,
  },
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  server: process.env.DATABASE_SERVER_NAME,
  user: process.env.DATABASE_USER,
});

export default databaseConfig;
