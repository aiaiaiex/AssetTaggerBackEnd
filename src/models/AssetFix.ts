import z from "zod";

import {
  EXCLUDED_BIGINT_SCHEMA,
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  EXCLUDED_DATETIMEOFFSET_SCHEMA,
  EXCLUDED_DECIMAL_SCHEMA,
  EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
  NORMALIZED_WEB_URL_SCHEMA,
} from "../constants/CheckConstraintConstants";
import {
  TSQL_BIGINT_SCHEMA,
  TSQL_BIT_SCHEMA,
  TSQL_DATETIMEOFFSET_SCHEMA,
  TSQL_DECIMAL_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { zodExclude } from "../utils/zodUtils";
import { AssetIssueSchema } from "./AssetIssue";
import { EmployeeSchema } from "./Employee";

export const AssetFixSchema = z.object({
  AssetFixCost: zodExclude(
    TSQL_DECIMAL_SCHEMA,
    EXCLUDED_DECIMAL_SCHEMA,
  ).nullable(),
  AssetFixDateDays: zodExclude(
    TSQL_BIGINT_SCHEMA.min(0n),
    EXCLUDED_BIGINT_SCHEMA,
  ).nullable(),
  AssetFixDateEnd: zodExclude(
    TSQL_DATETIMEOFFSET_SCHEMA,
    EXCLUDED_DATETIMEOFFSET_SCHEMA,
  ).nullable(),
  AssetFixDateStart: zodExclude(
    TSQL_DATETIMEOFFSET_SCHEMA,
    EXCLUDED_DATETIMEOFFSET_SCHEMA,
  ),
  AssetFixDescription: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ).nullable(),
  AssetFixDocumentationURL: NORMALIZED_WEB_URL_SCHEMA.max(4000).nullable(),
  AssetFixed: TSQL_BIT_SCHEMA,
  AssetFixID: zodExclude(
    z.uuid({ version: "v4" }),
    EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  ),
  AssetFixTitle: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1).max(4000),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ),
  AssetIssueID: AssetIssueSchema.shape.AssetIssueID,
  EmployeeID: EmployeeSchema.shape.EmployeeID,
});

export type AssetFix = z.infer<typeof AssetFixSchema>;
