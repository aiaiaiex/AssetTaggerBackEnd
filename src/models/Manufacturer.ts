import z from "zod";

import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
} from "../constants/ZodConstants";
import { zodExclude } from "../utils/zodUtils";

export const ManufacturerSchema = z.object({
  ManufacturerID: z.uuid({ version: "v4" }),
  ManufacturerInsertDate: z.date(),
  ManufacturerName: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1).max(850),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ),
});

export type Manufacturer = z.infer<typeof ManufacturerSchema>;
