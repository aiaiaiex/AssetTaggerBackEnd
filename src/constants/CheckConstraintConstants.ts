import z from "zod";

import {
  NON_NULLISH_NCHAR,
  NON_NULLISH_NVARCHAR,
  NON_NULLISH_UNIQUEIDENTIFIER,
} from "./NonNullishConstants";
import {
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
    description: `matches the following unique identifiers [${NULLISH_UNIQUEIDENTIFIER}, ${NON_NULLISH_UNIQUEIDENTIFIER}]`,
    title: "EXCLUDED_UNIQUEIDENTIFIER_SCHEMA",
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
