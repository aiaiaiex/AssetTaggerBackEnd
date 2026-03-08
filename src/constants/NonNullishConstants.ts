import z from "zod";

export const NonNullishConstantsSchema = z.object({
  NON_NULLISH_NVARCHAR: z.literal("!"),
  NON_NULLISH_UNIQUEIDENTIFIER: z.literal(
    "11111111-1111-1111-1111-111111111111",
  ),
});

export type NonNullishConstants = z.infer<typeof NonNullishConstantsSchema>;

export const {
  NON_NULLISH_NVARCHAR,
  NON_NULLISH_UNIQUEIDENTIFIER,
}: NonNullishConstants = {
  NON_NULLISH_NVARCHAR:
    NonNullishConstantsSchema.shape.NON_NULLISH_NVARCHAR.value,
  NON_NULLISH_UNIQUEIDENTIFIER:
    NonNullishConstantsSchema.shape.NON_NULLISH_UNIQUEIDENTIFIER.value,
};
