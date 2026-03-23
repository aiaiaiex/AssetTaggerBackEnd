import { Router } from "express";

import {
  createCategory,
  deleteCategory,
  readCategories,
  readCategory,
  updateCategory,
} from "../controllers/categoryController";

const categoryRoutes = Router();

categoryRoutes.post("/", createCategory);
categoryRoutes.get("/", readCategories);
categoryRoutes.get("/:CategoryID", readCategory);
categoryRoutes.patch("/:CategoryID", updateCategory);
categoryRoutes.delete("/:CategoryID", deleteCategory);

export default categoryRoutes;
