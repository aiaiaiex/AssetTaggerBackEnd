import { Router } from "express";

import {
  createRole,
  deleteRole,
  readRole,
  readRoles,
  updateRole,
} from "../controllers/roleController";

const roleRoutes = Router();

roleRoutes.post("/", createRole);
roleRoutes.get("/", readRoles);
roleRoutes.get("/:RoleID", readRole);
roleRoutes.patch("/:RoleID", updateRole);
roleRoutes.delete("/:RoleID", deleteRole);

export default roleRoutes;
