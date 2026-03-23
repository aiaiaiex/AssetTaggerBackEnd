import { Router } from "express";

import {
  createBuilding,
  deleteBuilding,
  readBuilding,
  readBuildings,
  updateBuilding,
} from "../controllers/buildingController";

const buildingRoutes = Router();

buildingRoutes.post("/", createBuilding);
buildingRoutes.get("/", readBuildings);
buildingRoutes.get("/:BuildingID", readBuilding);
buildingRoutes.patch("/:BuildingID", updateBuilding);
buildingRoutes.delete("/:BuildingID", deleteBuilding);

export default buildingRoutes;
