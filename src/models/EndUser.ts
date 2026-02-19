import z from "zod";

export const EndUserSchema = z.object({
  EmployeeID: z.uuid().optional(),
  EndUserID: z.uuid(),
  EndUserName: z
    .string()
    .max(50)
    .lowercase()
    .refine((x) => {
      return x.search(/\s/) === -1;
    }, "Should not have whitespace!"),
  EndUserPassword: z.string().max(255).optional(),
  EndUserPasswordHash: z.string().length(32),
  EndUserRoleID: z.uuid().optional(),
});

export type EndUser = z.infer<typeof EndUserSchema>;
