import z from "zod";

import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  EXCLUDED_DATETIMEOFFSET_SCHEMA,
  EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  NO_WHITESPACE_SCHEMA,
} from "../constants/CheckConstraintConstants";
import { TSQL_DATETIMEOFFSET_SCHEMA } from "../constants/TSQLDataTypeConstants";
import { zodExclude } from "../utils/zodUtils";
import { EmployeeSchema } from "./Employee";
import { EndUserRoleSchema } from "./EndUserRole";

export const EndUserSchema = z.object({
  EmployeeID: EmployeeSchema.shape.EmployeeID,
  EndUserID: zodExclude(
    z.uuid({ version: "v4" }),
    EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  ),
  EndUserName: zodExclude(
    NO_WHITESPACE_SCHEMA.min(1).max(850),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ),
  EndUserPassword: z.string().optional(), // Optional because it is not in the database.
  EndUserRegisterDate: zodExclude(
    TSQL_DATETIMEOFFSET_SCHEMA,
    EXCLUDED_DATETIMEOFFSET_SCHEMA,
  ),
  EndUserRoleID: EndUserRoleSchema.shape.EndUserRoleID,
});

export type EndUser = z.infer<typeof EndUserSchema>;
