import { Router } from "express";

import {
  createEndUserRole,
  deleteEndUserRole,
  readEndUserRole,
  readEndUserRoles,
  updateEndUserRole,
} from "../controllers/endUserRoleController";

const endUserRoleRoutes = Router();

endUserRoleRoutes.post("/", createEndUserRole);
endUserRoleRoutes.get("/", readEndUserRoles);
endUserRoleRoutes.get("/:EndUserRoleID", readEndUserRole);
endUserRoleRoutes.patch("/:EndUserRoleID", updateEndUserRole);
endUserRoleRoutes.delete("/:EndUserRoleID", deleteEndUserRole);

export default endUserRoleRoutes;
