import z from "zod";
import * as z4 from "zod/v4/core";

import { NO_WHITESPACE } from "../constants/RegExpConstants";

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

// The schema this returns only successfully parses its input when it matches zodSchema and not excludedZodSchema.
export function zodExclude<T extends z.ZodType>(
  zodSchema: T,
  excludedZodSchema: z.ZodType<
    z.infer<typeof zodSchema>,
    z.infer<typeof zodSchema>
  >,
) {
  return zodSchema.transform((input, ctx) => {
    const parsedInput = excludedZodSchema.safeParse(input);

    if (parsedInput.success) {
      const title = excludedZodSchema.meta()?.title ?? "excludedZodSchema";
      const description = excludedZodSchema.meta()?.description ?? "";

      ctx.issues.push({
        code: "custom",
        input: input,
        message: `Invalid input: should not match ${title}${
          description ? ` which ${description}` : ""
        }`,
      });

      // Exit transform without impacting the inferred return type.
      // See more:
      // https://zod.dev/api?id=transforms
      return z.NEVER;
    }

    return input;
  });
}

export function zodParseNumber<T extends z4.$ZodType<bigint | number>>(
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

// z.xor() with zodCombineUnionErrorMessages.
export function zodXOR<T extends z4.$ZodType>(zodSchemas: T[]) {
  return z.xor(zodSchemas, { error: zodCombineUnionErrorMessages });
}
