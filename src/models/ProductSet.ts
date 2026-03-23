import z from "zod";

import { EXCLUDED_DATETIMEOFFSET_SCHEMA } from "../constants/CheckConstraintConstants";
import {
  TSQL_DATETIMEOFFSET_SCHEMA,
  TSQL_INT_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { zodExclude } from "../utils/zodUtils";
import { ProductSchema } from "./Product";

export const ProductSetSchema = z.object({
  ParentProductID: ProductSchema.shape.ProductID,
  ProductID: ProductSchema.shape.ProductID,
  ProductSetInsertDate: zodExclude(
    TSQL_DATETIMEOFFSET_SCHEMA,
    EXCLUDED_DATETIMEOFFSET_SCHEMA,
  ),
  ProductSetProductQuantity: TSQL_INT_SCHEMA.min(1),
});

export type ProductSet = z.infer<typeof ProductSetSchema>;
