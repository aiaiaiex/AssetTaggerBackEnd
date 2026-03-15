import { Router } from "express";

import {
  createAuthentication,
  deleteAuthentication,
} from "../controllers/authenticationController";

const authenticationRoutes = Router();

authenticationRoutes.post("/", createAuthentication);
authenticationRoutes.delete("/", deleteAuthentication);

export default authenticationRoutes;
