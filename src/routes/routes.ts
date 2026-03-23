import { Router } from "express";

import { expressJWTGetMiddleware } from "../utils/expressJWTUtils";
import authenticationRoutes from "./authenticationRoutes";
import endUserRoutes from "./endUserRoutes";
import logRoutes from "./logRoutes";
import manufacturerRoutes from "./manufacturerRoutes";
import roleRoutes from "./roleRoutes";
import rootRoutes from "./rootRoutes";
import vendorRoutes from "./vendorRoutes";

const routes = Router();

routes.use("/", rootRoutes);
routes.use("/authentication", authenticationRoutes);
routes.use("/enduser", expressJWTGetMiddleware(), endUserRoutes);
routes.use("/log", expressJWTGetMiddleware(), logRoutes);
routes.use("/manufacturer", expressJWTGetMiddleware(), manufacturerRoutes);
routes.use("/role", expressJWTGetMiddleware(), roleRoutes);
routes.use("/vendor", expressJWTGetMiddleware(), vendorRoutes);

export default routes;
