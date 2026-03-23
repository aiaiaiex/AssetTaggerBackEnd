import { Router } from "express";

import {
  createEmployee,
  deleteEmployee,
  readEmployee,
  readEmployees,
  updateEmployee,
} from "../controllers/employeeController";

const employeeRoutes = Router();

employeeRoutes.post("/", createEmployee);
employeeRoutes.get("/", readEmployees);
employeeRoutes.get("/:EmployeeID", readEmployee);
employeeRoutes.patch("/:EmployeeID", updateEmployee);
employeeRoutes.delete("/:EmployeeID", deleteEmployee);

export default employeeRoutes;
