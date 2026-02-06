import sql from "mssql";
import databaseConfig from "./config/databaseConfig";

const pool = new sql.ConnectionPool(databaseConfig);

export default pool;
