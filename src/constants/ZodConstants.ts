import z from "zod";

import {
  NO_LEADING_AND_TRAILING_WHITESPACE,
  NO_WHITESPACE,
} from "./RegExpConstants";

// This schema returns input in UPPERCASE during a successful parse.
export const EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA = z
  .string()
  .toUpperCase() // Make it case-insensitive by converting input to UPPERCASE.
  .pipe(z.enum(["", "!", "NULL"])) // Make sure that all strings passed to enum() are UPPERCASE!
  .meta({
    description:
      "matches the following case-insensitive strings ['', '!', 'NULL']",
    title: "EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA",
  });

export const NO_WHITESPACE_SCHEMA = z
  .stringFormat("no-whitespace", NO_WHITESPACE, {
    error: "Invalid input: string must not have whitespace",
  })
  .meta({
    description: "matches strings without whitespace",
    title: "NO_WHITESPACE_SCHEMA",
  });

export const NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA = z.stringFormat(
  "no-leading-and-trailing-whitespace",
  NO_LEADING_AND_TRAILING_WHITESPACE,
  {
    error:
      "Invalid input: string must not have leading and trailing whitespace",
  },
);
