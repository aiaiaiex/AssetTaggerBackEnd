import z from "zod";
import * as z4 from "zod/v4/core";

export function zodStringToNumber<
  T extends z4.$ZodType<
    unknown,
    number | undefined,
    z4.$ZodTypeInternals<unknown, number | undefined>
  >,
>(
  zodSchema: T,
  prefaultValue?: number,
  emptyStringValue = NaN, // This is also returned when a string only has whitespace.
) {
  return z
    .string()
    .optional()
    .transform((x) => {
      if (typeof x === "string") {
        // x.trim().length > 0 is called to prevent calling Number() with an empty string or a string with only whitespace which results to the number 0.
        // Change emptyStringValue to 0 to revert back to Number()'s default behavior.
        return x.trim().length > 0 ? Number(x) : emptyStringValue;
      } else {
        return prefaultValue;
      }
    })
    .pipe(zodSchema);
}
