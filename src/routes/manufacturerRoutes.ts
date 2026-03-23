import { Router } from "express";

import {
  createManufacturer,
  deleteManufacturer,
  readManufacturer,
  readManufacturers,
  updateManufacturer,
} from "../controllers/manufacturerController";

const manufacturerRoutes = Router();

manufacturerRoutes.post("/", createManufacturer);
manufacturerRoutes.get("/", readManufacturers);
manufacturerRoutes.get("/:ManufacturerID", readManufacturer);
manufacturerRoutes.patch("/:ManufacturerID", updateManufacturer);
manufacturerRoutes.delete("/:ManufacturerID", deleteManufacturer);

export default manufacturerRoutes;
