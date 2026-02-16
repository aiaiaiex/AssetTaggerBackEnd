import express from "express";

import serverConfig from "./configs/serverConfig";
import pool from "./database";
import acknowledgeFaviconRequest from "./middlewares/acknowledgeFaviconRequest";
import handleError from "./middlewares/handleError";
import logRequest from "./middlewares/logRequest";
import logResponse from "./middlewares/logResponse";
import routes from "./routes/routes";

const app = express();

app.use([logRequest, logResponse, acknowledgeFaviconRequest]);

app.use("/api", routes);

// "...define error-handling middleware last..."
// See more:
// https://expressjs.com/en/guide/error-handling.html
app.use(handleError);

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
