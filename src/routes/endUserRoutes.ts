import { Router } from "express";

import { createEndUser, deleteEndUser } from "../controllers/endUserController";

const endUserRoutes = Router();

endUserRoutes.post("/", createEndUser);
endUserRoutes.delete("/:EndUserID", deleteEndUser);

export default endUserRoutes;
