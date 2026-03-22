import z from "zod";

import {
  EXCLUDED_BIGINT_SCHEMA,
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  EXCLUDED_DATETIMEOFFSET_SCHEMA,
  EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
} from "../constants/CheckConstraintConstants";
import { storedProcedureConstants } from "../constants/StoredProcedureConstants";
import {
  TSQL_BIGINT_SCHEMA,
  TSQL_BIT_SCHEMA,
  TSQL_DATETIMEOFFSET_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { zodExclude, zodXOR } from "../utils/zodUtils";
import { EndUserSchema } from "./EndUser";

export const LogSchema = z.object({
  EndUserID: EndUserSchema.shape.EndUserID.nullable(),
  LogEndUserIP: zodXOR([z.ipv4(), z.ipv6()]).nullable(),
  LogID: zodExclude(
    z.uuid({ version: "v4" }),
    EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  ),
  LogStoredProcedureEnd: zodExclude(
    TSQL_DATETIMEOFFSET_SCHEMA,
    EXCLUDED_DATETIMEOFFSET_SCHEMA,
  ),
  LogStoredProcedureMilliseconds: zodExclude(
    TSQL_BIGINT_SCHEMA.min(0n),
    EXCLUDED_BIGINT_SCHEMA,
  ),
  LogStoredProcedureName: z.enum(storedProcedureConstants),
  LogStoredProcedureParameters: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ),
  LogStoredProcedureStart: zodExclude(
    TSQL_DATETIMEOFFSET_SCHEMA,
    EXCLUDED_DATETIMEOFFSET_SCHEMA,
  ),
  LogStoredProcedureSuccess: TSQL_BIT_SCHEMA,
});

export type Log = z.infer<typeof LogSchema>;
