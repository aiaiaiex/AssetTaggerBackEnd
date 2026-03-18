import z from "zod";

import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
} from "../constants/ZodConstants";
import { zodExclude } from "../utils/zodUtils";
import { CategorySchema } from "./Category";
import { ManufacturerSchema } from "./Manufacturer";

export const ProductSchema = z.object({
  CategoryID: CategorySchema.shape.CategoryID,
  ManufacturerID: ManufacturerSchema.shape.ManufacturerID.nullable(),
  ProductDocumentationURL: z
    .url({ hostname: z.regexes.domain, normalize: true, protocol: /^https?$/ })
    .nullable(),
  ProductID: z.uuid({ version: "v4" }),
  ProductInsertDate: z.date(),
  ProductModelNumber: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1).max(421),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ).nullable(),
  ProductName: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1).max(421),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ).nullable(),
});

export type Product = z.infer<typeof ProductSchema>;
