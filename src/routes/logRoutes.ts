import { Router } from "express";

import { deleteLog, readLog, readLogs } from "../controllers/logController";

const logRoutes = Router();

logRoutes.get("/", readLogs);
logRoutes.get("/:LogID", readLog);
logRoutes.delete("/:LogID", deleteLog);

export default logRoutes;
