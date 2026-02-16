import { Router } from "express";

import { createEndUser } from "../controllers/endUserController";

const endUserRoutes = Router();

endUserRoutes.post("/", createEndUser);

export default endUserRoutes;
