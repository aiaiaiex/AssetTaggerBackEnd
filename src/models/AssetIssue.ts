import z from "zod";

import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  EXCLUDED_DATETIMEOFFSET_SCHEMA,
  EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
  NORMALIZED_WEB_URL_SCHEMA,
} from "../constants/CheckConstraintConstants";
import { TSQL_DATETIMEOFFSET_SCHEMA } from "../constants/TSQLDataTypeConstants";
import { zodExclude } from "../utils/zodUtils";
import { AssetSchema } from "./Asset";
import { EmployeeSchema } from "./Employee";

export const AssetIssueSchema = z.object({
  AssetID: AssetSchema.shape.AssetID,
  AssetIssueDate: zodExclude(
    TSQL_DATETIMEOFFSET_SCHEMA,
    EXCLUDED_DATETIMEOFFSET_SCHEMA,
  ),
  AssetIssueDescription: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ).nullable(),
  AssetIssueDocumentationURL: NORMALIZED_WEB_URL_SCHEMA.max(4000).nullable(),
  AssetIssueID: zodExclude(
    z.uuid({ version: "v4" }),
    EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  ),
  AssetIssueTitle: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1).max(4000),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ),
  EmployeeID: EmployeeSchema.shape.EmployeeID,
});

export type AssetIssue = z.infer<typeof AssetIssueSchema>;
