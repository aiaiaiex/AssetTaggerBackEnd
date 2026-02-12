import { Router } from "express";

import { ping } from "../controllers/rootController";

const rootRoutes = Router();

rootRoutes.get("/ping", ping);

export default rootRoutes;
