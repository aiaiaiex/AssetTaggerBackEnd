import z from "zod";

import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  EXCLUDED_DATETIMEOFFSET_SCHEMA,
  EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
  NORMALIZED_WEB_URL_SCHEMA,
} from "../constants/CheckConstraintConstants";
import { TSQL_DATETIMEOFFSET_SCHEMA } from "../constants/TSQLDataTypeConstants";
import { zodExclude } from "../utils/zodUtils";
import { CategorySchema } from "./Category";
import { ManufacturerSchema } from "./Manufacturer";

export const ProductSchema = z.object({
  CategoryID: CategorySchema.shape.CategoryID,
  ManufacturerID: ManufacturerSchema.shape.ManufacturerID.nullable(),
  ProductDocumentationURL: NORMALIZED_WEB_URL_SCHEMA.max(4000).nullable(),
  ProductID: zodExclude(
    z.uuid({ version: "v4" }),
    EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  ),
  ProductInsertDate: zodExclude(
    TSQL_DATETIMEOFFSET_SCHEMA,
    EXCLUDED_DATETIMEOFFSET_SCHEMA,
  ),
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
