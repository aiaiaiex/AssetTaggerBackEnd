import z from "zod";
import * as z4 from "zod/v4/core";

export const zodCombineUnionErrorMessages = (iss: {
  errors: z.core.$ZodIssue[][];
  message?: string;
}): string => {
  return (
    (iss.message ??
      iss.errors.map((error) => `[${error[0].message}]`).join(" OR ")) ||
    "Invalid input: multiple options match"
  );
};

export const zodParseNull = (emptyStringValue: unknown = "") => {
  return z
    .transform((x) => {
      if (typeof x === "string") {
        if (x === "null") {
          return null;
        } else {
          return x.length > 0 ? x : emptyStringValue;
        }
      } else {
        return x;
      }
    })
    .pipe(z.null());
};

export function zodParseNumber<T extends z4.$ZodType<number>>(
  zodSchema: T,
  emptyStringValue: unknown = NaN,
) {
  return z
    .transform((x) => {
      // Do not try to convert strings with whitespace into numbers.
      if (typeof x === "string" && x.search(/\s/) === -1) {
        // x.length > 0 is checked to prevent calling Number() with an empty string (or a string with only whitespace which is impossible in this case) which results to the number 0.
        // Change emptyStringValue to 0 to revert back to Number()'s default behavior.
        return x.length > 0 ? Number(x) : emptyStringValue;
      } else {
        return x;
      }
    })
    .pipe(zodSchema);
}
