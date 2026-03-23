import { Router } from "express";

import {
  createAssetIssue,
  deleteAssetIssue,
  readAssetIssue,
  readAssetIssues,
  updateAssetIssue,
} from "../controllers/assetIssueController";

const assetIssueRoutes = Router();

assetIssueRoutes.post("/", createAssetIssue);
assetIssueRoutes.get("/", readAssetIssues);
assetIssueRoutes.get("/:AssetIssueID", readAssetIssue);
assetIssueRoutes.patch("/:AssetIssueID", updateAssetIssue);
assetIssueRoutes.delete("/:AssetIssueID", deleteAssetIssue);

export default assetIssueRoutes;
