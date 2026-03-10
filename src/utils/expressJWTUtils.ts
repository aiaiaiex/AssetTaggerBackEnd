import { JwtPayload } from "jsonwebtoken";
import z from "zod";

import { ExpressError } from "../middlewares/handleError";
import { EndUserSchema } from "../models/EndUser";

export const expressJWTGetEndUserID = (
  auth?: JwtPayload,
): z.infer<typeof EndUserSchema.shape.EndUserID> => {
  const payload = EndUserSchema.pick({ EndUserID: true }).safeParse(auth);

  if (!payload.success) {
    throw new ExpressError(z.prettifyError(payload.error), 400);
  }

  return payload.data.EndUserID;
};
