import { Router } from "express";

import {
  createProductSet,
  deleteProductSet,
  readProductSet,
  readProductSets,
  updateProductSet,
} from "../controllers/productSetController";

const productSetRoutes = Router();

productSetRoutes.post("/", createProductSet);
productSetRoutes.get("/", readProductSets);
productSetRoutes.get("/:ParentProductID/:ProductID", readProductSet);
productSetRoutes.patch("/:ParentProductID/:ProductID", updateProductSet);
productSetRoutes.delete("/:ParentProductID/:ProductID", deleteProductSet);

export default productSetRoutes;
