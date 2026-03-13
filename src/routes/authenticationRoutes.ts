import { Router } from "express";

import { createAuthentication } from "../controllers/authenticationController";

const authenticationRoutes = Router();

authenticationRoutes.post("/", createAuthentication);

export default authenticationRoutes;
