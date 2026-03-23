import { Router } from "express";

import {
  createVendor,
  deleteVendor,
  readVendor,
  readVendors,
  updateVendor,
} from "../controllers/vendorController";

const vendorRoutes = Router();

vendorRoutes.post("/", createVendor);
vendorRoutes.get("/", readVendors);
vendorRoutes.get("/:VendorID", readVendor);
vendorRoutes.patch("/:VendorID", updateVendor);
vendorRoutes.delete("/:VendorID", deleteVendor);

export default vendorRoutes;
