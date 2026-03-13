import z from "zod";
import * as z4 from "zod/v4/core";

import {
  NO_LEADING_AND_TRAILING_WHITESPACE,
  NO_WHITESPACE,
} from "../constants/RegExpConstants";

export const zodCombineUnionErrorMessages = (iss: {
  errors: z.core.$ZodIssue[][];
  message?: string;
}): string => {
  return (
    (iss.message ??
      iss.errors.map((error) => `[${error[0].message}]`).join(" OR ")) ||
    "Invalid input: matches multiple schemas in exclusive union"
  );
};

export const zodParseNull = (emptyStringValue: unknown = "") => {
  return z
    .transform((input) => {
      if (typeof input === "string") {
        if (input === "null") {
          return null;
        } else {
          return input.length > 0 ? input : emptyStringValue;
        }
      } else {
        return input;
      }
    })
    .pipe(z.null());
};

export function zodParseNumber<T extends z4.$ZodType<number>>(
  zodSchema: T,
  emptyStringValue: unknown = NaN,
) {
  return z
    .transform((input) => {
      // Do not try to convert strings with whitespace into numbers.
      if (typeof input === "string" && NO_WHITESPACE.test(input)) {
        // input.length > 0 is checked to prevent calling Number() with an empty string (or a string with only whitespace which is impossible in this case) which results to the number 0.
        // Change emptyStringValue to 0 to revert back to Number()'s default behavior.
        return input.length > 0 ? Number(input) : emptyStringValue;
      } else {
        return input;
      }
    })
    .pipe(zodSchema);
}

export const zodNoWhitespace = z.stringFormat("no-whitespace", NO_WHITESPACE, {
  error: "Invalid input: string must not have whitespace",
});

export const zodNoLeadingAndTrailingWhitespace = z.stringFormat(
  "no-leading-and-trailing-whitespace",
  NO_LEADING_AND_TRAILING_WHITESPACE,
  {
    error:
      "Invalid input: string must not have leading and trailing whitespace",
  },
);

// This only successfully parses input when it matches zodSchema and not excludedZodSchema.
export function zodExclude<T extends z.ZodType>(
  zodSchema: T,
  excludedZodSchema: z.ZodType<
    z.infer<typeof zodSchema>,
    z.infer<typeof zodSchema>
  >,
  errorMessage = "Invalid input: matches excludedZodSchema",
) {
  return zodSchema.transform((input, ctx) => {
    const parsedInput = excludedZodSchema.safeParse(input);

    if (parsedInput.success) {
      ctx.issues.push({
        code: "custom",
        input: input,
        message: errorMessage,
      });

      // Exit transform without impacting the inferred return type.
      // See more:
      // https://zod.dev/api?id=transforms
      return z.NEVER;
    }

    return input;
  });
}

// This passes emptyStringSubstitute to zodSchema when input is an empty string, which is similar to Zod's .prefault(value) method which passes value to the schema when input is undefined.
export function zodSubstituteEmptyString<T extends z4.$ZodType<string>>(
  zodSchema: T,
  emptyStringSubstitute: string,
) {
  return z
    .transform((input) => {
      if (typeof input === "string" && input.length === 0) {
        return emptyStringSubstitute;
      } else {
        return input;
      }
    })
    .pipe(zodSchema);
}
