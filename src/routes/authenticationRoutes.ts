import { Router } from "express";

import {
  createAuthentication,
  deleteAuthentication,
} from "../controllers/authenticationController";
import { expressJWTMiddleware } from "../utils/expressJWTUtils";

const authenticationRoutes = Router();

authenticationRoutes.post("/", createAuthentication);
authenticationRoutes.delete("/", expressJWTMiddleware, deleteAuthentication);

export default authenticationRoutes;
