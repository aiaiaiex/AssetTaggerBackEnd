import { Router } from "express";

import { createAuthentication } from "../controllers/authenticationController";

const authenticationRoutes = Router();

authenticationRoutes.post("/login", createAuthentication);

export default authenticationRoutes;
