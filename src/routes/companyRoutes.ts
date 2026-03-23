import { Router } from "express";

import {
  createCompany,
  deleteCompany,
  readCompanies,
  readCompany,
  updateCompany,
} from "../controllers/companyController";

const companyRoutes = Router();

companyRoutes.post("/", createCompany);
companyRoutes.get("/", readCompanies);
companyRoutes.get("/:CompanyID", readCompany);
companyRoutes.patch("/:CompanyID", updateCompany);
companyRoutes.delete("/:CompanyID", deleteCompany);

export default companyRoutes;
