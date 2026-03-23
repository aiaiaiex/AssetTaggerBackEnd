import { Router } from "express";

import {
  createDepartment,
  deleteDepartment,
  readDepartment,
  readDepartments,
  updateDepartment,
} from "../controllers/departmentController";

const departmentRoutes = Router();

departmentRoutes.post("/", createDepartment);
departmentRoutes.get("/", readDepartments);
departmentRoutes.get("/:DepartmentID", readDepartment);
departmentRoutes.patch("/:DepartmentID", updateDepartment);
departmentRoutes.delete("/:DepartmentID", deleteDepartment);

export default departmentRoutes;
