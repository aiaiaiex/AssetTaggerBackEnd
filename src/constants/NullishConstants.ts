import z from "zod";

export const NullishConstantsSchema = z.object({
  NULLISH_NVARCHAR: z.literal(""),
  NULLISH_UNIQUEIDENTIFIER: z.literal("00000000-0000-0000-0000-000000000000"),
});

export type NullishConstants = z.infer<typeof NullishConstantsSchema>;

export const { NULLISH_NVARCHAR, NULLISH_UNIQUEIDENTIFIER }: NullishConstants =
  {
    NULLISH_NVARCHAR: NullishConstantsSchema.shape.NULLISH_NVARCHAR.value,
    NULLISH_UNIQUEIDENTIFIER:
      NullishConstantsSchema.shape.NULLISH_UNIQUEIDENTIFIER.value,
  };
