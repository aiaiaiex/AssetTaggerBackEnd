import { Router } from "express";

import { expressJWTGetMiddleware } from "../utils/expressJWTUtils";
import authenticationRoutes from "./authenticationRoutes";
import endUserRoutes from "./endUserRoutes";
import logRoutes from "./logRoutes";
import rootRoutes from "./rootRoutes";

const routes = Router();

routes.use("/", rootRoutes);
routes.use("/authentication", authenticationRoutes);
routes.use("/enduser", expressJWTGetMiddleware(), endUserRoutes);
routes.use("/log", expressJWTGetMiddleware(), logRoutes);

export default routes;
