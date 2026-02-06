import express from "express";
import sql from "mssql";

import serverConfig from "./config/serverConfig";
import pool from "./database";

const app = express();

app.get("/ping", async (req, res) => {
  const { recordset } = await req.app.locals.database.query(
    "SELECT @@SERVERNAME AS 'serverName'",
  );

  res.json({
    msg: "pong!",
    recordSet: recordset,
  });
});

pool
  .connect()
  .then((pool) => {
    app.locals.database = pool;

    app.listen(serverConfig.port, () => {
      console.log(
        `Server listening on http://localhost:${serverConfig.port.toFixed(0)}`,
      );
    });
  })
  .catch((err: unknown) => {
    console.error("ERROR: ", err);
  });
