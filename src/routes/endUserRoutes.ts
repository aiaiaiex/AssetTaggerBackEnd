import { Router } from "express";

import {
  createEndUser,
  deleteEndUser,
  readEndUser,
  updateEndUser,
} from "../controllers/endUserController";

const endUserRoutes = Router();

endUserRoutes.post("/", createEndUser);
endUserRoutes.get("/:EndUserID", readEndUser);
endUserRoutes.patch("/:EndUserID", updateEndUser);
endUserRoutes.delete("/:EndUserID", deleteEndUser);

export default endUserRoutes;
