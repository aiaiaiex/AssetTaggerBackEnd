import { Router } from "express";

import rootRoutes from "./rootRoutes";

const routes = Router();

routes.use("/", rootRoutes);

export default routes;
