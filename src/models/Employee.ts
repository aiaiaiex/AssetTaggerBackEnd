import z from "zod";

import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
} from "../constants/ZodConstants";
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
  EmployeeID: z.uuid({ version: "v4" }),
  EmployeeInsertDate: z.date(),
  RoleID: RoleSchema.shape.RoleID,
});

export type Employee = z.infer<typeof EmployeeSchema>;
