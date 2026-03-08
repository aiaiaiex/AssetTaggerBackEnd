import z from "zod";

export const EndUserSchema = z.object({
  EmployeeID: z.uuid({ version: "v4" }),
  EndUserID: z.uuid({ version: "v4" }),
  EndUserName: z
    .stringFormat("no-whitespace", /^[^\s]*$/, {
      error: "Has whitespace: expected string to NOT have whitespace",
    })
    .min(1)
    .max(4000),
  EndUserPassword: z.string().max(4000).optional(), // Optional because it is not in the database.
  EndUserPasswordHash: z.hash("sha512"),
  EndUserRoleID: z.uuid({ version: "v4" }),
});

export type EndUser = z.infer<typeof EndUserSchema>;
