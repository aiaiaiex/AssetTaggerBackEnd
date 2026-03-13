import z from "zod";

import { EndUserSchema } from "./EndUser";

export const AuthenticationSchema = z.object({
  CallingEndUserID: EndUserSchema.shape.EndUserID,
});

export type Authentication = z.infer<typeof AuthenticationSchema>;
