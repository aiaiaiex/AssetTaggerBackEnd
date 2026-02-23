import { Router } from "express";

import {
  createEndUser,
  deleteEndUser,
  updateEndUser,
} from "../controllers/endUserController";

const endUserRoutes = Router();

endUserRoutes.post("/", createEndUser);
endUserRoutes.patch("/:EndUserID", updateEndUser);
endUserRoutes.delete("/:EndUserID", deleteEndUser);

export default endUserRoutes;
