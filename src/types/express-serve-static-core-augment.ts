import "express-serve-static-core";
import sql from "mssql";

declare module "express-serve-static-core" {
  export interface Locals {
    database: sql.ConnectionPool;
  }
}
