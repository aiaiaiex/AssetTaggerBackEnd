import { Router } from "express";

import {
  createAssetFix,
  deleteAssetFix,
  readAssetFix,
  readAssetFixes,
  updateAssetFix,
} from "../controllers/assetFixController";

const assetFixRoutes = Router();

assetFixRoutes.post("/", createAssetFix);
assetFixRoutes.get("/", readAssetFixes);
assetFixRoutes.get("/:AssetFixID", readAssetFix);
assetFixRoutes.patch("/:AssetFixID", updateAssetFix);
assetFixRoutes.delete("/:AssetFixID", deleteAssetFix);

export default assetFixRoutes;
