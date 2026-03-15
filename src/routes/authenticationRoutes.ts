import { Router } from "express";

import {
  createAuthentication,
  deleteAuthentication,
} from "../controllers/authenticationController";
import { expressJWTGetMiddleware } from "../utils/expressJWTUtils";

const authenticationRoutes = Router();

authenticationRoutes.post("/", createAuthentication);
authenticationRoutes.delete(
  "/",
  expressJWTGetMiddleware(),
  deleteAuthentication,
);

export default authenticationRoutes;
