import cookieParser from "cookie-parser";
import express, { json } from "express";
import { expressjwt, Request } from "express-jwt";
import z from "zod";

import authenticationConfig from "./configs/authenticationConfig";
import serverConfig from "./configs/serverConfig";
import pool from "./database";
import acknowledgeFaviconRequest from "./middlewares/acknowledgeFaviconRequest";
import handleError, { ExpressError } from "./middlewares/handleError";
import logRequest from "./middlewares/logRequest";
import routes from "./routes/routes";

const app = express();

app.use([
  logRequest,
  acknowledgeFaviconRequest,
  json(),
  cookieParser(),
  expressjwt({
    algorithms: [authenticationConfig.algorithms],
    getToken: (req: Request) => {
      const accesToken: unknown = req.cookies.access_token;

      const parsedAccessToken = z
        .jwt({ alg: authenticationConfig.algorithms })
        .safeParse(accesToken);

      if (!parsedAccessToken.success) {
        throw new ExpressError("No token!", 400);
      }

      return parsedAccessToken.data;
    },
    secret: authenticationConfig.secret,
  }).unless({
    path: [
      /^\/api$/,
      /^\/api\/authentication\/.*$/,
      /^(\/.+)*(\/favicon\.ico)$/,
    ],
  }),
]);

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
