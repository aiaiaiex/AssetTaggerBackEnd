import z from "zod";

import { zodExclude, zodNoWhitespace } from "../utils/zodUtils";

export const EndUserSchema = z.object({
  EmployeeID: z.uuid({ version: "v4" }),
  EndUserID: z.uuid({ version: "v4" }),
  EndUserName: zodExclude(
    zodNoWhitespace.min(1).max(4000),
    z
      .string()
      .toUpperCase() // Make it case-insensitive by converting input to uppercase.
      .pipe(z.enum(["", "!", "NULL"])), // Make sure that all strings passed to enum() are uppercase!
    "Invalid input: in excluded case-insensitive strings ('', '!', 'NULL')",
  ),
  EndUserPassword: z.string().max(4000).optional(), // Optional because it is not in the database.
  EndUserPasswordHash: z.hash("sha512"),
  EndUserRegisterDate: z.date(),
  EndUserRoleID: z.uuid({ version: "v4" }),
});

export type EndUser = z.infer<typeof EndUserSchema>;
