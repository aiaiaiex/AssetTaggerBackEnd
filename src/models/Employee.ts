import z from "zod";

import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  EXCLUDED_DATETIMEOFFSET_SCHEMA,
  EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
} from "../constants/CheckConstraintConstants";
import { TSQL_DATETIMEOFFSET_SCHEMA } from "../constants/TSQLDataTypeConstants";
import { zodExclude } from "../utils/zodUtils";
import { CompanySchema } from "./Company";
import { DepartmentSchema } from "./Department";
import { RoleSchema } from "./Role";

export const EmployeeSchema = z.object({
  CompanyID: CompanySchema.shape.CompanyID,
  DepartmentID: DepartmentSchema.shape.DepartmentID,
  EmployeeFullName: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1).max(850),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ),
  EmployeeID: zodExclude(
    z.uuid({ version: "v4" }),
    EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  ),
  EmployeeInsertDate: zodExclude(
    TSQL_DATETIMEOFFSET_SCHEMA,
    EXCLUDED_DATETIMEOFFSET_SCHEMA,
  ),
  RoleID: RoleSchema.shape.RoleID,
});

export type Employee = z.infer<typeof EmployeeSchema>;
