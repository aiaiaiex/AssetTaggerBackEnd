import { Router } from "express";

import { expressJWTGetMiddleware } from "../utils/expressJWTUtils";
import authenticationRoutes from "./authenticationRoutes";
import departmentRoutes from "./departmentRoutes";
import endUserRoleRoutes from "./endUserRoleRoutes";
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
routes.use("/department", expressJWTGetMiddleware(), departmentRoutes);
routes.use("/enduserrole", expressJWTGetMiddleware(), endUserRoleRoutes);
routes.use("/manufacturer", expressJWTGetMiddleware(), manufacturerRoutes);
routes.use("/role", expressJWTGetMiddleware(), roleRoutes);
routes.use("/vendor", expressJWTGetMiddleware(), vendorRoutes);

export default routes;
