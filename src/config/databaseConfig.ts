import { config } from "mssql";

const databaseConfig: config = {
  user: process.env.DATABASE_USER ?? "",
  password: process.env.DATABASE_PASSWORD ?? "",
  server: process.env.DATABASE_SERVER_NAME ?? "localhost",
  port: Number(process.env.DATABASE_PORT) || 1433,
  database: process.env.DATABASE_NAME ?? "",
  options: {
    encrypt: process.env.DATABASE_ENCRYPT?.toLowerCase() === "true",
    trustServerCertificate:
      process.env.DATABASE_TRUST_SERVER_CERTIFICATE?.toLowerCase() === "true",
  },
};

export default databaseConfig;
