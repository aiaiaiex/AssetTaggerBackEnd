import z from "zod";

export const NonNullishConstantsSchema = z.object({
  NON_NULLISH_DATETIMEOFFSET_ISO_STRING: z.literal("2900-01-01T00:00:00.000Z"),
  NON_NULLISH_DECIMAL: z.literal(99999999999.9999),
  NON_NULLISH_INT: z.literal(2147483647),
  NON_NULLISH_NCHAR: z.literal("!"),
  NON_NULLISH_NVARCHAR: z.literal("!"),
  NON_NULLISH_UNIQUEIDENTIFIER: z.literal(
    "11111111-1111-1111-1111-111111111111",
  ),
});

type NonNullishConstants = z.infer<typeof NonNullishConstantsSchema>;

export const {
  NON_NULLISH_DATETIMEOFFSET_ISO_STRING,
  NON_NULLISH_DECIMAL,
  NON_NULLISH_INT,
  NON_NULLISH_NCHAR,
  NON_NULLISH_NVARCHAR,
  NON_NULLISH_UNIQUEIDENTIFIER,
}: NonNullishConstants = {
  NON_NULLISH_DATETIMEOFFSET_ISO_STRING:
    NonNullishConstantsSchema.shape.NON_NULLISH_DATETIMEOFFSET_ISO_STRING.value,
  NON_NULLISH_DECIMAL:
    NonNullishConstantsSchema.shape.NON_NULLISH_DECIMAL.value,
  NON_NULLISH_INT: NonNullishConstantsSchema.shape.NON_NULLISH_INT.value,
  NON_NULLISH_NCHAR: NonNullishConstantsSchema.shape.NON_NULLISH_NCHAR.value,
  NON_NULLISH_NVARCHAR:
    NonNullishConstantsSchema.shape.NON_NULLISH_NVARCHAR.value,
  NON_NULLISH_UNIQUEIDENTIFIER:
    NonNullishConstantsSchema.shape.NON_NULLISH_UNIQUEIDENTIFIER.value,
};

export const NON_NULLISH_DATETIMEOFFSET_SCHEMA = z.date().refine(
  (date) => {
    return date.toISOString() === NON_NULLISH_DATETIMEOFFSET_ISO_STRING;
  },
  { error: `Invalid input: expected ${NON_NULLISH_DATETIMEOFFSET_ISO_STRING}` },
);

export const NON_NULLISH_DATETIMEOFFSET = new Date(
  NON_NULLISH_DATETIMEOFFSET_ISO_STRING,
);
