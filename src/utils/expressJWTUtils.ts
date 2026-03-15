import { expressjwt, Request } from "express-jwt";
import { JwtPayload } from "jsonwebtoken";
import z from "zod";

import authenticationConfig from "../configs/authenticationConfig";
import { ExpressError } from "../middlewares/handleError";
import { Authentication, AuthenticationSchema } from "../models/Authentication";

export const expressJWTGetPayload = (auth?: JwtPayload): Authentication => {
  const parsedPayload = AuthenticationSchema.safeParse(auth);

  if (!parsedPayload.success) {
    throw new ExpressError(z.prettifyError(parsedPayload.error), 400);
  }

  return parsedPayload.data;
};

export const expressJWTMiddleware = expressjwt({
  algorithms: [authenticationConfig.algorithms],
  getToken: (req: Request) => {
    const accesToken: unknown =
      req.cookies[authenticationConfig.cookieAccessTokenName];

    const parsedAccessToken = z
      .jwt({ alg: authenticationConfig.algorithms })
      .safeParse(accesToken);

    if (!parsedAccessToken.success) {
      throw new ExpressError("No token!", 400);
    }

    return parsedAccessToken.data;
  },
  secret: authenticationConfig.secret,
});
