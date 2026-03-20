import z from "zod";

import { TSQL_INT_SCHEMA } from "../constants/TSQLDataTypeConstants";
import { ProductSchema } from "./Product";

export const ProductSetSchema = z.object({
  ParentProductID: ProductSchema.shape.ProductID,
  ProductID: ProductSchema.shape.ProductID,
  ProductInsertDate: z.date(),
  ProductSetProductQuantity: TSQL_INT_SCHEMA.min(1),
});

export type ProductSet = z.infer<typeof ProductSetSchema>;
