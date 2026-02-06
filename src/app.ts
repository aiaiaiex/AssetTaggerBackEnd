import express from "express";

import serverConfig from "./config/serverConfig";
import pool from "./database";

const app = express();

app.get("/ping", (req, res) => {
  res.json({ msg: "pong!" });
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
