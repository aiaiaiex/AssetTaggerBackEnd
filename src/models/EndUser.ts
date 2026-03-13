import z from "zod";

import { EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA } from "../constants/ZodConstants";
import { zodExclude, zodNoWhitespace } from "../utils/zodUtils";

export const EndUserSchema = z.object({
  EmployeeID: z.uuid({ version: "v4" }),
  EndUserID: z.uuid({ version: "v4" }),
  EndUserName: zodExclude(
    zodNoWhitespace.min(1).max(4000),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ),
  EndUserPassword: z.string().max(4000).optional(), // Optional because it is not in the database.
  EndUserPasswordHash: z.hash("sha512"),
  EndUserRegisterDate: z.date(),
  EndUserRoleID: z.uuid({ version: "v4" }),
});

export type EndUser = z.infer<typeof EndUserSchema>;
