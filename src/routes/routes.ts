import { Router } from "express";

import { expressJWTGetMiddleware } from "../utils/expressJWTUtils";
import assetFixRoutes from "./assetFixRoutes";
import assetIssueRoutes from "./assetIssueRoutes";
import assetRoutes from "./assetRoutes";
import authenticationRoutes from "./authenticationRoutes";
import buildingRoutes from "./buildingRoutes";
import categoryRoutes from "./categoryRoutes";
import companyRoutes from "./companyRoutes";
import departmentRoutes from "./departmentRoutes";
import employeeRoutes from "./employeeRoutes";
import endUserRoleRoutes from "./endUserRoleRoutes";
import endUserRoutes from "./endUserRoutes";
import locationRoutes from "./locationRoutes";
import logRoutes from "./logRoutes";
import manufacturerRoutes from "./manufacturerRoutes";
import productRoutes from "./productRoutes";
import productSetRoutes from "./productSetRoutes";
import roleRoutes from "./roleRoutes";
import rootRoutes from "./rootRoutes";
import vendorRoutes from "./vendorRoutes";

const routes = Router();

routes.use("/", rootRoutes);
routes.use("/authentication", authenticationRoutes);
routes.use("/assetfix", expressJWTGetMiddleware(), assetFixRoutes);
routes.use("/assetissue", expressJWTGetMiddleware(), assetIssueRoutes);
routes.use("/asset", expressJWTGetMiddleware(), assetRoutes);
routes.use("/log", expressJWTGetMiddleware(), logRoutes);
routes.use("/enduser", expressJWTGetMiddleware(), endUserRoutes);
routes.use("/location", expressJWTGetMiddleware(), locationRoutes);
routes.use("/productset", expressJWTGetMiddleware(), productSetRoutes);
routes.use("/building", expressJWTGetMiddleware(), buildingRoutes);
routes.use("/employee", expressJWTGetMiddleware(), employeeRoutes);
routes.use("/product", expressJWTGetMiddleware(), productRoutes);
routes.use("/category", expressJWTGetMiddleware(), categoryRoutes);
routes.use("/company", expressJWTGetMiddleware(), companyRoutes);
routes.use("/department", expressJWTGetMiddleware(), departmentRoutes);
routes.use("/enduserrole", expressJWTGetMiddleware(), endUserRoleRoutes);
routes.use("/manufacturer", expressJWTGetMiddleware(), manufacturerRoutes);
routes.use("/role", expressJWTGetMiddleware(), roleRoutes);
routes.use("/vendor", expressJWTGetMiddleware(), vendorRoutes);

export default routes;
