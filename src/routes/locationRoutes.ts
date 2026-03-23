import { Router } from "express";

import {
  createLocation,
  deleteLocation,
  readLocation,
  readLocations,
  updateLocation,
} from "../controllers/locationController";

const locationRoutes = Router();

locationRoutes.post("/", createLocation);
locationRoutes.get("/", readLocations);
locationRoutes.get("/:LocationID", readLocation);
locationRoutes.patch("/:LocationID", updateLocation);
locationRoutes.delete("/:LocationID", deleteLocation);

export default locationRoutes;
