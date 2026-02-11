import { config } from "mssql";

const databaseConfig: config = {
  database: process.env.DATABASE_NAME ?? "",
  options: {
    encrypt: process.env.DATABASE_ENCRYPT?.toLowerCase() === "true",
    trustServerCertificate:
      process.env.DATABASE_TRUST_SERVER_CERTIFICATE?.toLowerCase() === "true",
  },
  password: process.env.DATABASE_PASSWORD ?? "",
  port: Number(process.env.DATABASE_PORT) || 1433,
  server: process.env.DATABASE_SERVER_NAME ?? "localhost",
  user: process.env.DATABASE_USER ?? "",
};

export default databaseConfig;
