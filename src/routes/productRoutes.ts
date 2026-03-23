import { Router } from "express";

import {
  createProduct,
  deleteProduct,
  readProduct,
  readProducts,
  updateProduct,
} from "../controllers/productController";

const productRoutes = Router();

productRoutes.post("/", createProduct);
productRoutes.get("/", readProducts);
productRoutes.get("/:ProductID", readProduct);
productRoutes.patch("/:ProductID", updateProduct);
productRoutes.delete("/:ProductID", deleteProduct);

export default productRoutes;
