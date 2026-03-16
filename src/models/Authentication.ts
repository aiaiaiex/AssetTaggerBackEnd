import z from "zod";

import { EndUserSchema } from "./EndUser";
import { LogSchema } from "./Log";

export const AuthenticationSchema = z.object({
  CallingEndUserID: EndUserSchema.shape.EndUserID,
  CallingEndUserIP: LogSchema.shape.LogEndUserIP,
});

export type Authentication = z.infer<typeof AuthenticationSchema>;
