import z from "zod";

import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
} from "../constants/CheckConstraintConstants";
import { zodExclude } from "../utils/zodUtils";

export const RoleSchema = z.object({
  RoleID: z.uuid({ version: "v4" }),
  RoleInsertDate: z.date(),
  RoleName: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1).max(850),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ),
});

export type Role = z.infer<typeof RoleSchema>;
