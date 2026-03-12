import z from "zod";

import { zodNoWhitespace } from "../utils/zodUtils";

export const EndUserSchema = z.object({
  EmployeeID: z.uuid({ version: "v4" }),
  EndUserID: z.uuid({ version: "v4" }),
  EndUserName: zodNoWhitespace
    .min(1)
    .max(4000)
    // Create an 'inverse' validation (i.e., validation fails when input matches schema).
    .transform((input, ctx) => {
      const parsedInput = z
        .enum(["", "!", "NULL"])
        // Make it case-insensitive by converting input to uppercase.
        // Make sure that all strings passed to enum() are uppercase!
        .safeParse(input.toUpperCase());

      if (parsedInput.success) {
        ctx.issues.push({
          code: "custom",
          input: input,
          message:
            "Invalid input: in excluded case-insensitive strings ('', '!', 'NULL')",
        });
        return z.NEVER;
      }

      return input;
    }),
  EndUserPassword: z.string().max(4000).optional(), // Optional because it is not in the database.
  EndUserPasswordHash: z.hash("sha512"),
  EndUserRegisterDate: z.date(),
  EndUserRoleID: z.uuid({ version: "v4" }),
});

export type EndUser = z.infer<typeof EndUserSchema>;
