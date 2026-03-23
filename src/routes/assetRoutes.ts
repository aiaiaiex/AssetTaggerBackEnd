import { Router } from "express";

import {
  createAsset,
  deleteAsset,
  readAsset,
  readAssets,
  updateAsset,
} from "../controllers/assetController";

const assetRoutes = Router();

assetRoutes.post("/", createAsset);
assetRoutes.get("/", readAssets);
assetRoutes.get("/:AssetID", readAsset);
assetRoutes.patch("/:AssetID", updateAsset);
assetRoutes.delete("/:AssetID", deleteAsset);

export default assetRoutes;
