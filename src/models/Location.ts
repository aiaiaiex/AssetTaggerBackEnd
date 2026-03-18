import z from "zod";

import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
} from "../constants/ZodConstants";
import { zodExclude } from "../utils/zodUtils";
import { BuildingSchema } from "./Building";

export const LocationSchema = z.object({
  BuildingID: BuildingSchema.shape.BuildingID,
  LocationAddress: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1).max(842),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ),
  LocationID: z.uuid({ version: "v4" }),
  LocationInsertDate: z.date(),
});

export type Location = z.infer<typeof LocationSchema>;
