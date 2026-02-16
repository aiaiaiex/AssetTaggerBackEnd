import { Router } from "express";

import endUserRoutes from "./endUserRoutes";
import rootRoutes from "./rootRoutes";

const routes = Router();

routes.use("/", rootRoutes);
routes.use("/enduser", endUserRoutes);

export default routes;
