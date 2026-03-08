import { Router } from "express";

import authenticationRoutes from "./authenticationRoutes";
import endUserRoutes from "./endUserRoutes";
import rootRoutes from "./rootRoutes";

const routes = Router();

routes.use("/", rootRoutes);
routes.use("/authentication", authenticationRoutes);
routes.use("/enduser", endUserRoutes);

export default routes;
