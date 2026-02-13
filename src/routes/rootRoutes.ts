import { Router } from "express";

import { getRoot } from "../controllers/rootController";

const rootRoutes = Router();

rootRoutes.get("/ping", getRoot);

export default rootRoutes;
