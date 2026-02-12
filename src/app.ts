import express from "express";

import serverConfig from "./configs/serverConfig";
import pool from "./database";
import rootRoutes from "./routes/rootRoutes";

const app = express();

// Routes
app.use("/", rootRoutes);

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
