import { JwtPayload } from "jsonwebtoken";
import z from "zod";

import { ExpressError } from "../middlewares/handleError";
import { EndUserSchema } from "../models/EndUser";

export const expressJWTGetEndUserID = (
  auth?: JwtPayload,
): z.infer<typeof EndUserSchema.shape.EndUserID> => {
  const parsedPayload = EndUserSchema.pick({ EndUserID: true }).safeParse(auth);

  if (!parsedPayload.success) {
    throw new ExpressError(z.prettifyError(parsedPayload.error), 400);
  }

  return parsedPayload.data.EndUserID;
};
