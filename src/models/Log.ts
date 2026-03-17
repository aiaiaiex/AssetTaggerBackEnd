import z from "zod";

import { storedProceduresConstants } from "../constants/StoredProceduresConstants";
import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  MSSQL_BIT_SCHEMA,
  MSSQL_INT_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
} from "../constants/ZodConstants";
import { zodExclude, zodXOR } from "../utils/zodUtils";
import { EndUserSchema } from "./EndUser";

export const LogSchema = z.object({
  EndUserID: EndUserSchema.shape.EndUserID.nullable(),
  LogEndUserIP: zodXOR([z.ipv4(), z.ipv6()]).nullable(),
  LogID: z.uuid({ version: "v4" }),
  LogStoredProcedureEnd: z.date(),
  LogStoredProcedureMilliseconds: MSSQL_INT_SCHEMA.min(0),
  LogStoredProcedureName: z.enum(storedProceduresConstants),
  LogStoredProcedureParameters: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ),
  LogStoredProcedureStart: z.date(),
  LogStoredProcedureSuccess: MSSQL_BIT_SCHEMA,
});

export type Log = z.infer<typeof LogSchema>;
