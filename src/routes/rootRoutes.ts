import { Router } from "express";

import { getRoot } from "../controllers/rootController";

const rootRoutes = Router();

rootRoutes.get("/", getRoot);

export default rootRoutes;
