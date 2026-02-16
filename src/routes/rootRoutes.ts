import { Router } from "express";

import { readRoot } from "../controllers/rootController";

const rootRoutes = Router();

rootRoutes.get("/", readRoot);

export default rootRoutes;
