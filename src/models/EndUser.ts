import z from "zod";

export const EndUserSchema = z.object({
  EmployeeID: z.uuid().nullable(),
  EndUserID: z.uuid(),
  EndUserName: z
    .string()
    .max(50)
    .lowercase()
    .refine((x) => {
      return x.search(/\s/) === -1;
    }, "Should not have whitespace!"),
  EndUserPassword: z.string().max(255).optional(), // Optional because it is not in the database.
  EndUserPasswordHash: z.string().length(32),
  EndUserRoleID: z.uuid().nullable(),
});

export type EndUser = z.infer<typeof EndUserSchema>;
