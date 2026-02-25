import z from "zod";

import { zodStringToNumber } from "../utils/zodUtils";

const DatabaseConfigOptionsSchema = z.object({
  encrypt: z.stringbool({
    case: "sensitive",
    falsy: ["false"],
    truthy: ["true", ""], // Empty strings default to true.
  }),
  trustServerCertificate: z.stringbool({
    case: "sensitive",
    falsy: ["false", ""], // Empty strings default to false.
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
  port: zodStringToNumber(z.int().min(0).max(65535), undefined, 1433),
  server: z
    .string()
    .transform((x) => {
      return x.length > 0 ? x : "localhost";
    })
    .pipe(z.string().min(1)),
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
