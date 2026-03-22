import z from "zod";

import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  EXCLUDED_DATETIMEOFFSET_SCHEMA,
  EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
} from "../constants/CheckConstraintConstants";
import { TSQL_DATETIMEOFFSET_SCHEMA } from "../constants/TSQLDataTypeConstants";
import { zodExclude } from "../utils/zodUtils";

export const CategorySchema = z.object({
  CategoryID: zodExclude(
    z.uuid({ version: "v4" }),
    EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  ),
  CategoryInsertDate: zodExclude(
    TSQL_DATETIMEOFFSET_SCHEMA,
    EXCLUDED_DATETIMEOFFSET_SCHEMA,
  ),
  CategoryName: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1).max(850),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ),
});

export type Category = z.infer<typeof CategorySchema>;
