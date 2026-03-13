import { JwtPayload } from "jsonwebtoken";
import z from "zod";

import { ExpressError } from "../middlewares/handleError";
import { Authentication, AuthenticationSchema } from "../models/Authentication";

export const expressJWTGetPayload = (auth?: JwtPayload): Authentication => {
  const parsedPayload = AuthenticationSchema.safeParse(auth);

  if (!parsedPayload.success) {
    throw new ExpressError(z.prettifyError(parsedPayload.error), 400);
  }

  return parsedPayload.data;
};
