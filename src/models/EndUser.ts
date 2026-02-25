import z from "zod";

export const EndUserSchema = z.object({
  EmployeeID: z.uuid().nullable(),
  EndUserID: z.uuid(),
  EndUserName: z
    .stringFormat("no-whitespace", /^[^\s]*$/, {
      error: "Has whitespace: expected string to NOT have whitespace",
    })
    .min(1)
    .max(50)
    .lowercase(),
  EndUserPassword: z.string().max(255).optional(), // Optional because it is not in the database.
  EndUserPasswordHash: z.string().length(32),
  EndUserRoleID: z.uuid().nullable(),
});

export type EndUser = z.infer<typeof EndUserSchema>;
