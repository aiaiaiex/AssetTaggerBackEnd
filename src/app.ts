import express from "express";
import serverConfig from "./configs/serverConfig";
import pool from "./database";

const app = express();

interface ServerName {
  serverName: string;
}

app.get("/ping", async (req, res) => {
  const { recordset } = await req.app.locals.database.query<
    ServerName | undefined
  >("SELECT @@SERVERNAME AS 'serverName'");

  res.json({
    msg: "pong!",
    serverName: recordset[0]?.serverName ?? "",
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
