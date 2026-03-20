import z from "zod";

// Range (inclusive): -2,147,483,648 to 2,147,483,647
// See more:
// https://learn.microsoft.com/en-us/sql/t-sql/data-types/int-bigint-smallint-and-tinyint-transact-sql
export const MSSQL_INT_SCHEMA = z.int().min(-2147483648).max(2147483647); // Range (inclusive): -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807

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
