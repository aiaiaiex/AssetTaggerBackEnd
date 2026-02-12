import express from "express";

import serverConfig from "./configs/serverConfig";
import pool from "./database";
import routes from "./routes/routes";

const app = express();

app.use("/", routes);

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
