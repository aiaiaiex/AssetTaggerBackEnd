import z from "zod";

import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  NO_WHITESPACE_SCHEMA,
} from "../constants/ZodConstants";
import { zodExclude } from "../utils/zodUtils";
import { EmployeeSchema } from "./Employee";
import { EndUserRoleSchema } from "./EndUserRole";

export const EndUserSchema = z.object({
  EmployeeID: EmployeeSchema.shape.EmployeeID,
  EndUserID: z.uuid({ version: "v4" }),
  EndUserName: zodExclude(
    NO_WHITESPACE_SCHEMA.min(1).max(850),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ),
  EndUserPassword: z.string().optional(), // Optional because it is not in the database.
  EndUserRegisterDate: z.date(),
  EndUserRoleID: EndUserRoleSchema.shape.EndUserRoleID,
});

export type EndUser = z.infer<typeof EndUserSchema>;
