import z from "zod";

import { NO_WHITESPACE } from "./RegExpConstants";

export const EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA = z
  .string()
  .toUpperCase() // Make it case-insensitive by converting input to uppercase.
  .pipe(z.enum(["", "!", "NULL"])) // Make sure that all strings passed to enum() are uppercase!
  .meta({
    description:
      "matches the following case-insensitive strings ['', '!', 'NULL']",
    title: "EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA",
  });

export const zodNoWhitespace = z.stringFormat("no-whitespace", NO_WHITESPACE, {
  error: "Invalid input: string must not have whitespace",
});
