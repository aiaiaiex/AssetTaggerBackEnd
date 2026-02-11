import sql from "mssql";

import databaseConfig from "./configs/databaseConfig";

const pool = new sql.ConnectionPool(databaseConfig);

export default pool;
