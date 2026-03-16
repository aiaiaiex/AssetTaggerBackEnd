import { Request } from "express";
import { expressjwt } from "express-jwt";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import z from "zod";

import authenticationConfig from "../configs/authenticationConfig";
import { ExpressError } from "../middlewares/handleError";
import { Authentication, AuthenticationSchema } from "../models/Authentication";

export function expressJWTGetPayload<T extends boolean = false>(
  payload: JwtPayload | undefined,
  optional?: T,
): T extends true ? Authentication | undefined : Authentication;
export function expressJWTGetPayload(
  payload: JwtPayload | undefined,
  optional = false,
): Authentication | undefined {
  const parsedPayload = optional
    ? AuthenticationSchema.optional().safeParse(payload)
    : AuthenticationSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new ExpressError(z.prettifyError(parsedPayload.error), 400);
  }

  return parsedPayload.data;
}

export const expressJWTGetMiddleware = (optional = false) => {
  return expressjwt({
    algorithms: [authenticationConfig.algorithms],
    credentialsRequired: !optional,
    getToken: (req: Request) => {
      const accessToken: unknown =
        req.cookies[authenticationConfig.cookieAccessTokenName];

      const parsedAccessToken = optional
        ? z
            .jwt({ alg: authenticationConfig.algorithms })
            .optional()
            .safeParse(accessToken)
        : z
            .jwt({ alg: authenticationConfig.algorithms })
            .safeParse(accessToken);

      if (!parsedAccessToken.success) {
        throw new ExpressError(
          accessToken === undefined
            ? "No token!"
            : "Provided token is not a JWT!",
          400,
        );
      }

      if (
        authenticationConfig.ipInPayload &&
        parsedAccessToken.data !== undefined
      ) {
        const payload = jwt.verify(
          parsedAccessToken.data,
          authenticationConfig.secret,
          {
            algorithms: [authenticationConfig.algorithms],
            maxAge: authenticationConfig.expiresIn,
          },
        ) as JwtPayload;

        const { CallingEndUserIP } = expressJWTGetPayload(payload);

        if (CallingEndUserIP !== (req.ip ?? null)) {
          throw new ExpressError("Invalid IP address!", 400);
        }
      }

      return parsedAccessToken.data;
    },
    secret: authenticationConfig.secret,
  });
};
