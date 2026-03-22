import z from "zod";

import { zodXOR } from "../utils/zodUtils";
import {
  NON_NULLISH_DATETIMEOFFSET,
  NON_NULLISH_DECIMAL,
  NON_NULLISH_INT,
  NON_NULLISH_NCHAR,
  NON_NULLISH_NVARCHAR,
  NON_NULLISH_UNIQUEIDENTIFIER,
} from "./NonNullishConstants";
import {
  NULLISH_DATETIMEOFFSET,
  NULLISH_DECIMAL,
  NULLISH_INT,
  NULLISH_NCHAR,
  NULLISH_NVARCHAR,
  NULLISH_UNIQUEIDENTIFIER,
} from "./NullishConstants";
import {
  NO_LEADING_AND_TRAILING_WHITESPACE,
  NO_WHITESPACE,
} from "./RegExpConstants";

// This schema returns input in UPPERCASE during a successful parse.
export const EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA = z
  .string()
  .toUpperCase() // Make it case-insensitive by converting input to UPPERCASE.
  .pipe(z.enum([NULLISH_NVARCHAR, NON_NULLISH_NVARCHAR, "NULL"])) // Make sure that all strings passed to enum() are UPPERCASE!
  .meta({
    description: `matches the following case-insensitive strings ['${NULLISH_NVARCHAR}', '${NON_NULLISH_NVARCHAR}', 'NULL']`,
    title: "EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA",
  });

// This schema returns input in UPPERCASE during a successful parse.
export const EXCLUDED_CASE_INSENSITIVE_NCHAR_SCHEMA = z
  .string()
  .toUpperCase() // Make it case-insensitive by converting input to UPPERCASE.
  .pipe(z.enum([NULLISH_NCHAR, NON_NULLISH_NCHAR, "NULL"])) // Make sure that all strings passed to enum() are UPPERCASE!
  .meta({
    description: `matches the following case-insensitive strings ['${NULLISH_NCHAR}', '${NON_NULLISH_NCHAR}', 'NULL']`,
    title: "EXCLUDED_CASE_INSENSITIVE_NCHAR_SCHEMA",
  });

export const EXCLUDED_UNIQUEIDENTIFIER_SCHEMA = z
  .guid()
  .pipe(z.enum([NULLISH_UNIQUEIDENTIFIER, NON_NULLISH_UNIQUEIDENTIFIER]))
  .meta({
    description: `matches the following unique identifiers ['${NULLISH_UNIQUEIDENTIFIER}', '${NON_NULLISH_UNIQUEIDENTIFIER}']`,
    title: "EXCLUDED_UNIQUEIDENTIFIER_SCHEMA",
  });

export const EXCLUDED_INT_SCHEMA = zodXOR([
  z.int().lte(NULLISH_INT),
  z.int().gte(NON_NULLISH_INT),
]).meta({
  description: `matches integers lesser than or equal to ${NULLISH_INT.toString()} or integers greater than or equal to ${NON_NULLISH_INT.toString()}`,
  title: "EXCLUDED_INT_SCHEMA",
});

export const EXCLUDED_DECIMAL_SCHEMA = zodXOR([
  z.number().lte(NULLISH_DECIMAL),
  z.number().gte(NON_NULLISH_DECIMAL),
]).meta({
  description: `matches numbers lesser than or equal to ${NULLISH_DECIMAL.toString()} or numbers greater than or equal to ${NON_NULLISH_DECIMAL.toString()}`,
  title: "EXCLUDED_DECIMAL_SCHEMA",
});

export const EXCLUDED_DATETIMEOFFSET_SCHEMA = zodXOR([
  z.date().refine((date) => {
    return date.getTime() <= NULLISH_DATETIMEOFFSET.getTime();
  }),
  z.date().refine((date) => {
    return date.getTime() >= NON_NULLISH_DATETIMEOFFSET.getTime();
  }),
]).meta({
  description: `matches dates older than or equal to ${NULLISH_DATETIMEOFFSET.toISOString()} or dates newer than or equal to ${NON_NULLISH_DATETIMEOFFSET.toISOString()}`,
  title: "EXCLUDED_DATETIMEOFFSET_SCHEMA",
});

export const NO_WHITESPACE_SCHEMA = z
  .stringFormat("no-whitespace", NO_WHITESPACE, {
    error: "Invalid input: string must not have whitespace",
  })
  .meta({
    description: "matches strings without whitespace",
    title: "NO_WHITESPACE_SCHEMA",
  });

export const NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA = z
  .stringFormat(
    "no-leading-and-trailing-whitespace",
    NO_LEADING_AND_TRAILING_WHITESPACE,
    {
      error:
        "Invalid input: string must not have leading and trailing whitespace",
    },
  )
  .meta({
    description: "matches strings without leading and trailing whitespace",
    title: "NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA",
  });

// This schema returns a NORMALIZED input during a successful parse.
export const NORMALIZED_WEB_URL_SCHEMA = z.url({
  hostname: z.regexes.domain,
  normalize: true,
  protocol: /^https?$/,
});
