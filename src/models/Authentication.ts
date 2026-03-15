import z from "zod";

import { EndUserSchema } from "./EndUser";

export const AuthenticationSchema = z.object({
  CallingEndUserID: EndUserSchema.shape.EndUserID,
  CallingEndUserIP: z.xor([z.ipv4(), z.ipv6()]).optional(),
});

export type Authentication = z.infer<typeof AuthenticationSchema>;
