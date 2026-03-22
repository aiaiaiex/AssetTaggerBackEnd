import z from "zod";

export const NullishConstantsSchema = z.object({
  NULLISH_DATETIMEOFFSET_ISO_STRING: z.literal("1900-01-01T00:00:00.000Z"),
  NULLISH_DECIMAL: z.literal(-99999999999.9999),
  NULLISH_INT: z.literal(-2147483648),
  NULLISH_NCHAR: z.literal(""),
  NULLISH_NVARCHAR: z.literal(""),
  NULLISH_UNIQUEIDENTIFIER: z.literal("00000000-0000-0000-0000-000000000000"),
});

type NullishConstants = z.infer<typeof NullishConstantsSchema>;

export const {
  NULLISH_DATETIMEOFFSET_ISO_STRING,
  NULLISH_DECIMAL,
  NULLISH_INT,
  NULLISH_NCHAR,
  NULLISH_NVARCHAR,
  NULLISH_UNIQUEIDENTIFIER,
}: NullishConstants = {
  NULLISH_DATETIMEOFFSET_ISO_STRING:
    NullishConstantsSchema.shape.NULLISH_DATETIMEOFFSET_ISO_STRING.value,
  NULLISH_DECIMAL: NullishConstantsSchema.shape.NULLISH_DECIMAL.value,
  NULLISH_INT: NullishConstantsSchema.shape.NULLISH_INT.value,
  NULLISH_NCHAR: NullishConstantsSchema.shape.NULLISH_NCHAR.value,
  NULLISH_NVARCHAR: NullishConstantsSchema.shape.NULLISH_NVARCHAR.value,
  NULLISH_UNIQUEIDENTIFIER:
    NullishConstantsSchema.shape.NULLISH_UNIQUEIDENTIFIER.value,
};

export const NULLISH_DATETIMEOFFSET_SCHEMA = z.date().refine(
  (date) => {
    return date.toISOString() === NULLISH_DATETIMEOFFSET_ISO_STRING;
  },
  { error: `Invalid input: expected ${NULLISH_DATETIMEOFFSET_ISO_STRING}` },
);

export const NULLISH_DATETIMEOFFSET = new Date(
  NULLISH_DATETIMEOFFSET_ISO_STRING,
);
