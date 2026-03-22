import z from "zod";

import {
  EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  EXCLUDED_DATETIMEOFFSET_SCHEMA,
  EXCLUDED_DECIMAL_SCHEMA,
  EXCLUDED_INT_SCHEMA,
  EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA,
  NORMALIZED_WEB_URL_SCHEMA,
} from "../constants/CheckConstraintConstants";
import {
  TSQL_DATETIMEOFFSET_SCHEMA,
  TSQL_DECIMAL_SCHEMA,
  TSQL_INT_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { zodExclude } from "../utils/zodUtils";
import { EmployeeSchema } from "./Employee";
import { LocationSchema } from "./Location";
import { ProductSchema } from "./Product";
import { VendorSchema } from "./Vendor";

export const AssetSchema = z.object({
  AssetAnnualDepreciationExpense: zodExclude(
    TSQL_DECIMAL_SCHEMA,
    EXCLUDED_DECIMAL_SCHEMA,
  ).nullable(),
  AssetCurrentBookValue: zodExclude(
    TSQL_DECIMAL_SCHEMA,
    EXCLUDED_DECIMAL_SCHEMA,
  ).nullable(),
  AssetDocumentationURL: NORMALIZED_WEB_URL_SCHEMA.max(4000).nullable(),
  AssetID: zodExclude(
    z.uuid({ version: "v4" }),
    EXCLUDED_UNIQUEIDENTIFIER_SCHEMA,
  ),
  AssetPurchaseDate: zodExclude(
    TSQL_DATETIMEOFFSET_SCHEMA,
    EXCLUDED_DATETIMEOFFSET_SCHEMA,
  ).nullable(),
  AssetPurchasePrice: zodExclude(
    TSQL_DECIMAL_SCHEMA,
    EXCLUDED_DECIMAL_SCHEMA,
  ).nullable(),
  AssetSalvageValue: zodExclude(
    TSQL_DECIMAL_SCHEMA,
    EXCLUDED_DECIMAL_SCHEMA,
  ).nullable(),
  AssetSerialNumber: zodExclude(
    NO_LEADING_AND_TRAILING_WHITESPACE_SCHEMA.min(1).max(842),
    EXCLUDED_CASE_INSENSITIVE_NVARCHAR_SCHEMA,
  ).nullable(),
  AssetTagDate: zodExclude(
    TSQL_DATETIMEOFFSET_SCHEMA,
    EXCLUDED_DATETIMEOFFSET_SCHEMA,
  ),
  AssetUsefulLife: zodExclude(
    TSQL_INT_SCHEMA.min(0),
    EXCLUDED_INT_SCHEMA,
  ).nullable(),
  AssetWarrantyDuration: zodExclude(
    TSQL_INT_SCHEMA.min(0),
    EXCLUDED_INT_SCHEMA,
  ).nullable(),
  AssetWarrantyExpirationDate: zodExclude(
    TSQL_DATETIMEOFFSET_SCHEMA,
    EXCLUDED_DATETIMEOFFSET_SCHEMA,
  ).nullable(),
  AssetWarrantyUnitOfMeasure: z.enum(["yy", "mm", "ww", "dd"]).nullable(),
  EmployeeID: EmployeeSchema.shape.EmployeeID,
  LocationID: LocationSchema.shape.LocationID,
  ProductID: ProductSchema.shape.ProductID,
  VendorID: VendorSchema.shape.VendorID.nullable(),
});

export type Asset = z.infer<typeof AssetSchema>;
