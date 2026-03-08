import { Router } from "express";

import { logInEndUser } from "../controllers/authenticationController";

const authenticationRoutes = Router();

authenticationRoutes.post("/login", logInEndUser);

export default authenticationRoutes;
