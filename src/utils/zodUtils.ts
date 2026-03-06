import z from "zod";
import * as z4 from "zod/v4/core";

export function zodParseNull<T extends z4.$ZodType<null | string | undefined>>(
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

export function zodParseNumber<
  T extends z4.$ZodType<null | number | string | undefined>,
>(
  zodSchema: T,
  prefaultValue?: number | string,
  emptyStringValue: number | string | undefined = NaN,
) {
  return z
    .transform((x) => {
      if (typeof x === "string") {
        if (x.search(/\s/) === -1) {
          // x.length > 0 is checked to prevent calling Number() with an empty string (or a string with only whitespace which is impossible in this case) which results to the number 0.
          // Change emptyStringValue to 0 to revert back to Number()'s default behavior.
          return x.length > 0 ? Number(x) : emptyStringValue;
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
