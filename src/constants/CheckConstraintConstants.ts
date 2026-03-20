import z from "zod";

import { NON_NULLISH_NVARCHAR } from "./NonNullishConstants";
import { NULLISH_NVARCHAR } from "./NullishConstants";
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

// Range (inclusive): -2,147,483,648 to 2,147,483,647
// See more:
// https://learn.microsoft.com/en-us/sql/t-sql/data-types/int-bigint-smallint-and-tinyint-transact-sql
export const MSSQL_INT_SCHEMA = z.int().min(-2147483648).max(2147483647);

// Range (inclusive): -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807
// See more:
// https://learn.microsoft.com/en-us/sql/t-sql/data-types/int-bigint-smallint-and-tinyint-transact-sql
export const MSSQL_BIGINT_SCHEMA = z
  .bigint()
  .min(-9223372036854775808n)
  .max(9223372036854775807n);

// 0 or 1.
// See more:
// https://learn.microsoft.com/en-us/sql/t-sql/data-types/bit-transact-sql
export const MSSQL_BIT_SCHEMA = z.literal([0, 1]);

type MSSQL_BIT = z.infer<typeof MSSQL_BIT_SCHEMA>;

export const BOOLEAN_TO_MSSQL_BIT_SCHEMA = z
  .boolean()
  .transform((input): MSSQL_BIT => {
    return input ? 1 : 0;
  })
  .pipe(MSSQL_BIT_SCHEMA);
