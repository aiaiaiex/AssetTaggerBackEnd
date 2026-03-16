import z from "zod";

import { NullishConstantsSchema } from "../constants/NullishConstants";
import { storedProceduresConstants } from "../constants/StoredProceduresConstants";
import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
} from "../constants/ZodConstants";
import { zodCombineUnionErrorMessages, zodExclude } from "../utils/zodUtils";
import { EndUserSchema } from "./EndUser";

export const LogSchema = z.object({
  EndUserID: EndUserSchema.shape.EndUserID,
  LogEndUserIP: z.xor([z.ipv4(), z.ipv6()]).nullable(),
  LogID: z.xor(
    [
      z.uuid({ version: "v4" }),
      NullishConstantsSchema.shape.NULLISH_UNIQUEIDENTIFIER,
    ],
    { error: zodCombineUnionErrorMessages },
  ),
  LogStoredProcedureEnd: z.date(),
  LogStoredProcedureMilliseconds: z.int().min(0),
  LogStoredProcedureName: z.enum(storedProceduresConstants),
  LogStoredProcedureParameters: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ),
  LogStoredProcedureStart: z.date(),
  LogStoredProcedureSuccess: z.int().min(0).max(1),
});

export type Log = z.infer<typeof LogSchema>;
