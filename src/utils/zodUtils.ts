import z from "zod";
import * as z4 from "zod/v4/core";

export function zodParseNull<
  T extends z4.$ZodType<
    unknown,
    null | string | undefined,
    z4.$ZodTypeInternals<unknown, null | string | undefined>
  >,
>(
  zodSchema: T,
  prefaultValue?: null | string,
  emptyStringValue: null | string | undefined = "",
) {
  return z
    .transform((x) => {
      if (typeof x === "string") {
        if (x === "null") {
          return null;
        } else if (x.length === 0) {
          return emptyStringValue;
        } else {
          return x;
        }
      } else if (typeof x === "undefined") {
        return prefaultValue;
      } else {
        return x;
      }
    })
    .pipe(zodSchema);
}

export function zodStringToNumber<
  T extends z4.$ZodType<
    unknown,
    number | undefined,
    z4.$ZodTypeInternals<unknown, number | undefined>
  >,
>(zodSchema: T, prefaultValue?: number, emptyStringValue = NaN) {
  return z
    .stringFormat("no-whitespace", /^[^\s]*$/, {
      error: "Has whitespace: expected string to NOT have whitespace",
    })
    .optional()
    .transform((x) => {
      if (typeof x === "string") {
        // x.length > 0 is checked to prevent calling Number() with an empty string (or a string with only whitespace which is impossible in this case) which results to the number 0.
        // Change emptyStringValue to 0 to revert back to Number()'s default behavior.
        return x.length > 0 ? Number(x) : emptyStringValue;
      } else {
        return prefaultValue;
      }
    })
    .pipe(zodSchema);
}
