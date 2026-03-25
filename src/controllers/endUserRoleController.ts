import { Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import sql from "mssql";
import z from "zod";

import {
  USP_CREATE_ENDUSERROLE,
  USP_DELETE_ENDUSERROLE,
  USP_READ_ENDUSERROLE,
  USP_UPDATE_ENDUSERROLE,
} from "../constants/StoredProcedureConstants";
import {
  TSQL_BIT_SCHEMA,
  TSQL_INT_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { ExpressError } from "../middlewares/handleError";
import { EndUserRole, EndUserRoleSchema } from "../models/EndUserRole";
import { Log } from "../models/Log";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import {
  zodParseBitFromBoolean,
  zodParseDate,
  zodParseNumber,
  zodQuery,
} from "../utils/zodUtils";
import { usp_CreateLog } from "./logController";

export const createEndUserRole = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedBody = EndUserRoleSchema.omit({
    EndUserRoleCreationDate: true,
    EndUserRoleID: true,
  })
    .extend({
      CreateAsset: EndUserRoleSchema.shape.CreateAsset.prefault(0),
      CreateAssetFix: EndUserRoleSchema.shape.CreateAssetFix.prefault(0),
      CreateAssetIssue: EndUserRoleSchema.shape.CreateAssetIssue.prefault(0),
      CreateBuilding: EndUserRoleSchema.shape.CreateBuilding.prefault(0),
      CreateCategory: EndUserRoleSchema.shape.CreateCategory.prefault(0),
      CreateCompany: EndUserRoleSchema.shape.CreateCompany.prefault(0),
      CreateDepartment: EndUserRoleSchema.shape.CreateDepartment.prefault(0),
      CreateEmployee: EndUserRoleSchema.shape.CreateEmployee.prefault(0),
      CreateEndUser: EndUserRoleSchema.shape.CreateEndUser.prefault(0),
      CreateEndUserRole: EndUserRoleSchema.shape.CreateEndUserRole.prefault(0),
      CreateLocation: EndUserRoleSchema.shape.CreateLocation.prefault(0),
      CreateManufacturer:
        EndUserRoleSchema.shape.CreateManufacturer.prefault(0),
      CreateProduct: EndUserRoleSchema.shape.CreateProduct.prefault(0),
      CreateProductSet: EndUserRoleSchema.shape.CreateProductSet.prefault(0),
      CreateRole: EndUserRoleSchema.shape.CreateRole.prefault(0),
      CreateVendor: EndUserRoleSchema.shape.CreateVendor.prefault(0),
      DeleteAsset: EndUserRoleSchema.shape.DeleteAsset.prefault(0),
      DeleteAssetFix: EndUserRoleSchema.shape.DeleteAssetFix.prefault(0),
      DeleteAssetIssue: EndUserRoleSchema.shape.DeleteAssetIssue.prefault(0),
      DeleteBuilding: EndUserRoleSchema.shape.DeleteBuilding.prefault(0),
      DeleteCategory: EndUserRoleSchema.shape.DeleteCategory.prefault(0),
      DeleteCompany: EndUserRoleSchema.shape.DeleteCompany.prefault(0),
      DeleteDepartment: EndUserRoleSchema.shape.DeleteDepartment.prefault(0),
      DeleteEmployee: EndUserRoleSchema.shape.DeleteEmployee.prefault(0),
      DeleteEndUser: EndUserRoleSchema.shape.DeleteEndUser.prefault(0),
      DeleteEndUserRole: EndUserRoleSchema.shape.DeleteEndUserRole.prefault(0),
      DeleteLocation: EndUserRoleSchema.shape.DeleteLocation.prefault(0),
      DeleteLog: EndUserRoleSchema.shape.DeleteLog.prefault(0),
      DeleteManufacturer:
        EndUserRoleSchema.shape.DeleteManufacturer.prefault(0),
      DeleteProduct: EndUserRoleSchema.shape.DeleteProduct.prefault(0),
      DeleteProductSet: EndUserRoleSchema.shape.DeleteProductSet.prefault(0),
      DeleteRole: EndUserRoleSchema.shape.DeleteRole.prefault(0),
      DeleteVendor: EndUserRoleSchema.shape.DeleteVendor.prefault(0),
      ReadAsset: EndUserRoleSchema.shape.ReadAsset.prefault(0),
      ReadAssetFix: EndUserRoleSchema.shape.ReadAssetFix.prefault(0),
      ReadAssetIssue: EndUserRoleSchema.shape.ReadAssetIssue.prefault(0),
      ReadBuilding: EndUserRoleSchema.shape.ReadBuilding.prefault(0),
      ReadCategory: EndUserRoleSchema.shape.ReadCategory.prefault(0),
      ReadCompany: EndUserRoleSchema.shape.ReadCompany.prefault(0),
      ReadDepartment: EndUserRoleSchema.shape.ReadDepartment.prefault(0),
      ReadEmployee: EndUserRoleSchema.shape.ReadEmployee.prefault(0),
      ReadEndUser: EndUserRoleSchema.shape.ReadEndUser.prefault(0),
      ReadEndUserRole: EndUserRoleSchema.shape.ReadEndUserRole.prefault(0),
      ReadLocation: EndUserRoleSchema.shape.ReadLocation.prefault(0),
      ReadLog: EndUserRoleSchema.shape.ReadLog.prefault(0),
      ReadManufacturer: EndUserRoleSchema.shape.ReadManufacturer.prefault(0),
      ReadProduct: EndUserRoleSchema.shape.ReadProduct.prefault(0),
      ReadProductSet: EndUserRoleSchema.shape.ReadProductSet.prefault(0),
      ReadRole: EndUserRoleSchema.shape.ReadRole.prefault(0),
      ReadVendor: EndUserRoleSchema.shape.ReadVendor.prefault(0),
      UpdateAsset: EndUserRoleSchema.shape.UpdateAsset.prefault(0),
      UpdateAssetFix: EndUserRoleSchema.shape.UpdateAssetFix.prefault(0),
      UpdateAssetIssue: EndUserRoleSchema.shape.UpdateAssetIssue.prefault(0),
      UpdateBuilding: EndUserRoleSchema.shape.UpdateBuilding.prefault(0),
      UpdateCategory: EndUserRoleSchema.shape.UpdateCategory.prefault(0),
      UpdateCompany: EndUserRoleSchema.shape.UpdateCompany.prefault(0),
      UpdateDepartment: EndUserRoleSchema.shape.UpdateDepartment.prefault(0),
      UpdateEmployee: EndUserRoleSchema.shape.UpdateEmployee.prefault(0),
      UpdateEndUser: EndUserRoleSchema.shape.UpdateEndUser.prefault(0),
      UpdateEndUserRole: EndUserRoleSchema.shape.UpdateEndUserRole.prefault(0),
      UpdateLocation: EndUserRoleSchema.shape.UpdateLocation.prefault(0),
      UpdateManufacturer:
        EndUserRoleSchema.shape.UpdateManufacturer.prefault(0),
      UpdateProduct: EndUserRoleSchema.shape.UpdateProduct.prefault(0),
      UpdateProductSet: EndUserRoleSchema.shape.UpdateProductSet.prefault(0),
      UpdateRole: EndUserRoleSchema.shape.UpdateRole.prefault(0),
      UpdateVendor: EndUserRoleSchema.shape.UpdateVendor.prefault(0),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const {
    CreateAsset,
    CreateAssetFix,
    CreateAssetIssue,
    CreateBuilding,
    CreateCategory,
    CreateCompany,
    CreateDepartment,
    CreateEmployee,
    CreateEndUser,
    CreateEndUserRole,
    CreateLocation,
    CreateManufacturer,
    CreateProduct,
    CreateProductSet,
    CreateRole,
    CreateVendor,
    DeleteAsset,
    DeleteAssetFix,
    DeleteAssetIssue,
    DeleteBuilding,
    DeleteCategory,
    DeleteCompany,
    DeleteDepartment,
    DeleteEmployee,
    DeleteEndUser,
    DeleteEndUserRole,
    DeleteLocation,
    DeleteLog,
    DeleteManufacturer,
    DeleteProduct,
    DeleteProductSet,
    DeleteRole,
    DeleteVendor,
    EndUserRoleName,
    ReadAsset,
    ReadAssetFix,
    ReadAssetIssue,
    ReadBuilding,
    ReadCategory,
    ReadCompany,
    ReadDepartment,
    ReadEmployee,
    ReadEndUser,
    ReadEndUserRole,
    ReadLocation,
    ReadLog,
    ReadManufacturer,
    ReadProduct,
    ReadProductSet,
    ReadRole,
    ReadVendor,
    UpdateAsset,
    UpdateAssetFix,
    UpdateAssetIssue,
    UpdateBuilding,
    UpdateCategory,
    UpdateCompany,
    UpdateDepartment,
    UpdateEmployee,
    UpdateEndUser,
    UpdateEndUserRole,
    UpdateLocation,
    UpdateManufacturer,
    UpdateProduct,
    UpdateProductSet,
    UpdateRole,
    UpdateVendor,
  } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserRoleName", sql.NVarChar(850), EndUserRoleName)
    .input("CreateAsset", sql.Bit, CreateAsset)
    .input("CreateAssetFix", sql.Bit, CreateAssetFix)
    .input("CreateAssetIssue", sql.Bit, CreateAssetIssue)
    .input("CreateBuilding", sql.Bit, CreateBuilding)
    .input("CreateCategory", sql.Bit, CreateCategory)
    .input("CreateCompany", sql.Bit, CreateCompany)
    .input("CreateDepartment", sql.Bit, CreateDepartment)
    .input("CreateEmployee", sql.Bit, CreateEmployee)
    .input("CreateEndUser", sql.Bit, CreateEndUser)
    .input("CreateEndUserRole", sql.Bit, CreateEndUserRole)
    .input("CreateLocation", sql.Bit, CreateLocation)
    .input("CreateManufacturer", sql.Bit, CreateManufacturer)
    .input("CreateProduct", sql.Bit, CreateProduct)
    .input("CreateProductSet", sql.Bit, CreateProductSet)
    .input("CreateRole", sql.Bit, CreateRole)
    .input("CreateVendor", sql.Bit, CreateVendor)
    .input("ReadAsset", sql.Bit, ReadAsset)
    .input("ReadAssetFix", sql.Bit, ReadAssetFix)
    .input("ReadAssetIssue", sql.Bit, ReadAssetIssue)
    .input("ReadBuilding", sql.Bit, ReadBuilding)
    .input("ReadCategory", sql.Bit, ReadCategory)
    .input("ReadCompany", sql.Bit, ReadCompany)
    .input("ReadDepartment", sql.Bit, ReadDepartment)
    .input("ReadEmployee", sql.Bit, ReadEmployee)
    .input("ReadEndUser", sql.Bit, ReadEndUser)
    .input("ReadEndUserRole", sql.Bit, ReadEndUserRole)
    .input("ReadLocation", sql.Bit, ReadLocation)
    .input("ReadLog", sql.Bit, ReadLog)
    .input("ReadManufacturer", sql.Bit, ReadManufacturer)
    .input("ReadProduct", sql.Bit, ReadProduct)
    .input("ReadProductSet", sql.Bit, ReadProductSet)
    .input("ReadRole", sql.Bit, ReadRole)
    .input("ReadVendor", sql.Bit, ReadVendor)
    .input("UpdateAsset", sql.Bit, UpdateAsset)
    .input("UpdateAssetFix", sql.Bit, UpdateAssetFix)
    .input("UpdateAssetIssue", sql.Bit, UpdateAssetIssue)
    .input("UpdateBuilding", sql.Bit, UpdateBuilding)
    .input("UpdateCategory", sql.Bit, UpdateCategory)
    .input("UpdateCompany", sql.Bit, UpdateCompany)
    .input("UpdateDepartment", sql.Bit, UpdateDepartment)
    .input("UpdateEmployee", sql.Bit, UpdateEmployee)
    .input("UpdateEndUser", sql.Bit, UpdateEndUser)
    .input("UpdateEndUserRole", sql.Bit, UpdateEndUserRole)
    .input("UpdateLocation", sql.Bit, UpdateLocation)
    .input("UpdateManufacturer", sql.Bit, UpdateManufacturer)
    .input("UpdateProduct", sql.Bit, UpdateProduct)
    .input("UpdateProductSet", sql.Bit, UpdateProductSet)
    .input("UpdateRole", sql.Bit, UpdateRole)
    .input("UpdateVendor", sql.Bit, UpdateVendor)
    .input("DeleteAsset", sql.Bit, DeleteAsset)
    .input("DeleteAssetFix", sql.Bit, DeleteAssetFix)
    .input("DeleteAssetIssue", sql.Bit, DeleteAssetIssue)
    .input("DeleteBuilding", sql.Bit, DeleteBuilding)
    .input("DeleteCategory", sql.Bit, DeleteCategory)
    .input("DeleteCompany", sql.Bit, DeleteCompany)
    .input("DeleteDepartment", sql.Bit, DeleteDepartment)
    .input("DeleteEmployee", sql.Bit, DeleteEmployee)
    .input("DeleteEndUser", sql.Bit, DeleteEndUser)
    .input("DeleteEndUserRole", sql.Bit, DeleteEndUserRole)
    .input("DeleteLocation", sql.Bit, DeleteLocation)
    .input("DeleteLog", sql.Bit, DeleteLog)
    .input("DeleteManufacturer", sql.Bit, DeleteManufacturer)
    .input("DeleteProduct", sql.Bit, DeleteProduct)
    .input("DeleteProductSet", sql.Bit, DeleteProductSet)
    .input("DeleteRole", sql.Bit, DeleteRole)
    .input("DeleteVendor", sql.Bit, DeleteVendor)
    .execute<EndUserRole>(USP_CREATE_ENDUSERROLE)
    .then(({ recordset }) => {
      const parsedRecordset = EndUserRoleSchema.extend({
        CreateAsset: zodParseBitFromBoolean,
        CreateAssetFix: zodParseBitFromBoolean,
        CreateAssetIssue: zodParseBitFromBoolean,
        CreateBuilding: zodParseBitFromBoolean,
        CreateCategory: zodParseBitFromBoolean,
        CreateCompany: zodParseBitFromBoolean,
        CreateDepartment: zodParseBitFromBoolean,
        CreateEmployee: zodParseBitFromBoolean,
        CreateEndUser: zodParseBitFromBoolean,
        CreateEndUserRole: zodParseBitFromBoolean,
        CreateLocation: zodParseBitFromBoolean,
        CreateManufacturer: zodParseBitFromBoolean,
        CreateProduct: zodParseBitFromBoolean,
        CreateProductSet: zodParseBitFromBoolean,
        CreateRole: zodParseBitFromBoolean,
        CreateVendor: zodParseBitFromBoolean,
        DeleteAsset: zodParseBitFromBoolean,
        DeleteAssetFix: zodParseBitFromBoolean,
        DeleteAssetIssue: zodParseBitFromBoolean,
        DeleteBuilding: zodParseBitFromBoolean,
        DeleteCategory: zodParseBitFromBoolean,
        DeleteCompany: zodParseBitFromBoolean,
        DeleteDepartment: zodParseBitFromBoolean,
        DeleteEmployee: zodParseBitFromBoolean,
        DeleteEndUser: zodParseBitFromBoolean,
        DeleteEndUserRole: zodParseBitFromBoolean,
        DeleteLocation: zodParseBitFromBoolean,
        DeleteLog: zodParseBitFromBoolean,
        DeleteManufacturer: zodParseBitFromBoolean,
        DeleteProduct: zodParseBitFromBoolean,
        DeleteProductSet: zodParseBitFromBoolean,
        DeleteRole: zodParseBitFromBoolean,
        DeleteVendor: zodParseBitFromBoolean,
        ReadAsset: zodParseBitFromBoolean,
        ReadAssetFix: zodParseBitFromBoolean,
        ReadAssetIssue: zodParseBitFromBoolean,
        ReadBuilding: zodParseBitFromBoolean,
        ReadCategory: zodParseBitFromBoolean,
        ReadCompany: zodParseBitFromBoolean,
        ReadDepartment: zodParseBitFromBoolean,
        ReadEmployee: zodParseBitFromBoolean,
        ReadEndUser: zodParseBitFromBoolean,
        ReadEndUserRole: zodParseBitFromBoolean,
        ReadLocation: zodParseBitFromBoolean,
        ReadLog: zodParseBitFromBoolean,
        ReadManufacturer: zodParseBitFromBoolean,
        ReadProduct: zodParseBitFromBoolean,
        ReadProductSet: zodParseBitFromBoolean,
        ReadRole: zodParseBitFromBoolean,
        ReadVendor: zodParseBitFromBoolean,
        UpdateAsset: zodParseBitFromBoolean,
        UpdateAssetFix: zodParseBitFromBoolean,
        UpdateAssetIssue: zodParseBitFromBoolean,
        UpdateBuilding: zodParseBitFromBoolean,
        UpdateCategory: zodParseBitFromBoolean,
        UpdateCompany: zodParseBitFromBoolean,
        UpdateDepartment: zodParseBitFromBoolean,
        UpdateEmployee: zodParseBitFromBoolean,
        UpdateEndUser: zodParseBitFromBoolean,
        UpdateEndUserRole: zodParseBitFromBoolean,
        UpdateLocation: zodParseBitFromBoolean,
        UpdateManufacturer: zodParseBitFromBoolean,
        UpdateProduct: zodParseBitFromBoolean,
        UpdateProductSet: zodParseBitFromBoolean,
        UpdateRole: zodParseBitFromBoolean,
        UpdateVendor: zodParseBitFromBoolean,
      })
        .array()
        .length(1)
        .safeParse(recordset);

      if (!parsedRecordset.success) {
        throw new ExpressError(z.prettifyError(parsedRecordset.error), 500);
      }

      res.json(parsedRecordset.data[0]);
    })
    .catch((error: unknown) => {
      storedProcedureEnd = storedProcedureEnd ?? new Date();
      storedProcedureSuccess = 0;

      if (error instanceof Error) {
        throw error;
      }
    })
    .finally(async () => {
      await usp_CreateLog(
        req.app.locals.database,
        CallingEndUserID,
        req.ip ?? null,
        storedProcedureStart,
        storedProcedureEnd,
        storedProcedureSuccess,
        USP_CREATE_ENDUSERROLE,
        JSON.stringify({ CallingEndUserID, ...parsedBody.data }),
      );
    });
};

export const readEndUserRole = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = EndUserRoleSchema.pick({
    EndUserRoleID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { EndUserRoleID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserRoleID", sql.UniqueIdentifier, EndUserRoleID)
    .execute<EndUserRole>(USP_READ_ENDUSERROLE)
    .then(({ recordset }) => {
      const parsedRecordset = EndUserRoleSchema.extend({
        CreateAsset: zodParseBitFromBoolean,
        CreateAssetFix: zodParseBitFromBoolean,
        CreateAssetIssue: zodParseBitFromBoolean,
        CreateBuilding: zodParseBitFromBoolean,
        CreateCategory: zodParseBitFromBoolean,
        CreateCompany: zodParseBitFromBoolean,
        CreateDepartment: zodParseBitFromBoolean,
        CreateEmployee: zodParseBitFromBoolean,
        CreateEndUser: zodParseBitFromBoolean,
        CreateEndUserRole: zodParseBitFromBoolean,
        CreateLocation: zodParseBitFromBoolean,
        CreateManufacturer: zodParseBitFromBoolean,
        CreateProduct: zodParseBitFromBoolean,
        CreateProductSet: zodParseBitFromBoolean,
        CreateRole: zodParseBitFromBoolean,
        CreateVendor: zodParseBitFromBoolean,
        DeleteAsset: zodParseBitFromBoolean,
        DeleteAssetFix: zodParseBitFromBoolean,
        DeleteAssetIssue: zodParseBitFromBoolean,
        DeleteBuilding: zodParseBitFromBoolean,
        DeleteCategory: zodParseBitFromBoolean,
        DeleteCompany: zodParseBitFromBoolean,
        DeleteDepartment: zodParseBitFromBoolean,
        DeleteEmployee: zodParseBitFromBoolean,
        DeleteEndUser: zodParseBitFromBoolean,
        DeleteEndUserRole: zodParseBitFromBoolean,
        DeleteLocation: zodParseBitFromBoolean,
        DeleteLog: zodParseBitFromBoolean,
        DeleteManufacturer: zodParseBitFromBoolean,
        DeleteProduct: zodParseBitFromBoolean,
        DeleteProductSet: zodParseBitFromBoolean,
        DeleteRole: zodParseBitFromBoolean,
        DeleteVendor: zodParseBitFromBoolean,
        ReadAsset: zodParseBitFromBoolean,
        ReadAssetFix: zodParseBitFromBoolean,
        ReadAssetIssue: zodParseBitFromBoolean,
        ReadBuilding: zodParseBitFromBoolean,
        ReadCategory: zodParseBitFromBoolean,
        ReadCompany: zodParseBitFromBoolean,
        ReadDepartment: zodParseBitFromBoolean,
        ReadEmployee: zodParseBitFromBoolean,
        ReadEndUser: zodParseBitFromBoolean,
        ReadEndUserRole: zodParseBitFromBoolean,
        ReadLocation: zodParseBitFromBoolean,
        ReadLog: zodParseBitFromBoolean,
        ReadManufacturer: zodParseBitFromBoolean,
        ReadProduct: zodParseBitFromBoolean,
        ReadProductSet: zodParseBitFromBoolean,
        ReadRole: zodParseBitFromBoolean,
        ReadVendor: zodParseBitFromBoolean,
        UpdateAsset: zodParseBitFromBoolean,
        UpdateAssetFix: zodParseBitFromBoolean,
        UpdateAssetIssue: zodParseBitFromBoolean,
        UpdateBuilding: zodParseBitFromBoolean,
        UpdateCategory: zodParseBitFromBoolean,
        UpdateCompany: zodParseBitFromBoolean,
        UpdateDepartment: zodParseBitFromBoolean,
        UpdateEmployee: zodParseBitFromBoolean,
        UpdateEndUser: zodParseBitFromBoolean,
        UpdateEndUserRole: zodParseBitFromBoolean,
        UpdateLocation: zodParseBitFromBoolean,
        UpdateManufacturer: zodParseBitFromBoolean,
        UpdateProduct: zodParseBitFromBoolean,
        UpdateProductSet: zodParseBitFromBoolean,
        UpdateRole: zodParseBitFromBoolean,
        UpdateVendor: zodParseBitFromBoolean,
      })
        .array()
        .max(1)
        .safeParse(recordset);

      if (!parsedRecordset.success) {
        throw new ExpressError(z.prettifyError(parsedRecordset.error), 500);
      }

      res.json(parsedRecordset.data[0]);
    })
    .catch((error: unknown) => {
      storedProcedureEnd = storedProcedureEnd ?? new Date();
      storedProcedureSuccess = 0;

      if (error instanceof Error) {
        throw error;
      }
    })
    .finally(async () => {
      await usp_CreateLog(
        req.app.locals.database,
        CallingEndUserID,
        req.ip ?? null,
        storedProcedureStart,
        storedProcedureEnd,
        storedProcedureSuccess,
        USP_READ_ENDUSERROLE,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};

export const readEndUserRoles = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedQuery = EndUserRoleSchema.omit({
    EndUserRoleCreationDate: true,
    EndUserRoleID: true,
  })
    .extend({
      CreateAsset: zodQuery([EndUserRoleSchema.shape.CreateAsset]).prefault(
        null,
      ),
      CreateAssetFix: zodQuery([
        EndUserRoleSchema.shape.CreateAssetFix,
      ]).prefault(null),
      CreateAssetIssue: zodQuery([
        EndUserRoleSchema.shape.CreateAssetIssue,
      ]).prefault(null),
      CreateBuilding: zodQuery([
        EndUserRoleSchema.shape.CreateBuilding,
      ]).prefault(null),
      CreateCategory: zodQuery([
        EndUserRoleSchema.shape.CreateCategory,
      ]).prefault(null),
      CreateCompany: zodQuery([EndUserRoleSchema.shape.CreateCompany]).prefault(
        null,
      ),
      CreateDepartment: zodQuery([
        EndUserRoleSchema.shape.CreateDepartment,
      ]).prefault(null),
      CreateEmployee: zodQuery([
        EndUserRoleSchema.shape.CreateEmployee,
      ]).prefault(null),
      CreateEndUser: zodQuery([EndUserRoleSchema.shape.CreateEndUser]).prefault(
        null,
      ),
      CreateEndUserRole: zodQuery([
        EndUserRoleSchema.shape.CreateEndUserRole,
      ]).prefault(null),
      CreateLocation: zodQuery([
        EndUserRoleSchema.shape.CreateLocation,
      ]).prefault(null),
      CreateManufacturer: zodQuery([
        EndUserRoleSchema.shape.CreateManufacturer,
      ]).prefault(null),
      CreateProduct: zodQuery([EndUserRoleSchema.shape.CreateProduct]).prefault(
        null,
      ),
      CreateProductSet: zodQuery([
        EndUserRoleSchema.shape.CreateProductSet,
      ]).prefault(null),
      CreateRole: zodQuery([EndUserRoleSchema.shape.CreateRole]).prefault(null),
      CreateVendor: zodQuery([EndUserRoleSchema.shape.CreateVendor]).prefault(
        null,
      ),
      DeleteAsset: zodQuery([EndUserRoleSchema.shape.DeleteAsset]).prefault(
        null,
      ),
      DeleteAssetFix: zodQuery([
        EndUserRoleSchema.shape.DeleteAssetFix,
      ]).prefault(null),
      DeleteAssetIssue: zodQuery([
        EndUserRoleSchema.shape.DeleteAssetIssue,
      ]).prefault(null),
      DeleteBuilding: zodQuery([
        EndUserRoleSchema.shape.DeleteBuilding,
      ]).prefault(null),
      DeleteCategory: zodQuery([
        EndUserRoleSchema.shape.DeleteCategory,
      ]).prefault(null),
      DeleteCompany: zodQuery([EndUserRoleSchema.shape.DeleteCompany]).prefault(
        null,
      ),
      DeleteDepartment: zodQuery([
        EndUserRoleSchema.shape.DeleteDepartment,
      ]).prefault(null),
      DeleteEmployee: zodQuery([
        EndUserRoleSchema.shape.DeleteEmployee,
      ]).prefault(null),
      DeleteEndUser: zodQuery([EndUserRoleSchema.shape.DeleteEndUser]).prefault(
        null,
      ),
      DeleteEndUserRole: zodQuery([
        EndUserRoleSchema.shape.DeleteEndUserRole,
      ]).prefault(null),
      DeleteLocation: zodQuery([
        EndUserRoleSchema.shape.DeleteLocation,
      ]).prefault(null),
      DeleteLog: zodQuery([EndUserRoleSchema.shape.DeleteLog]).prefault(null),
      DeleteManufacturer: zodQuery([
        EndUserRoleSchema.shape.DeleteManufacturer,
      ]).prefault(null),
      DeleteProduct: zodQuery([EndUserRoleSchema.shape.DeleteProduct]).prefault(
        null,
      ),
      DeleteProductSet: zodQuery([
        EndUserRoleSchema.shape.DeleteProductSet,
      ]).prefault(null),
      DeleteRole: zodQuery([EndUserRoleSchema.shape.DeleteRole]).prefault(null),
      DeleteVendor: zodQuery([EndUserRoleSchema.shape.DeleteVendor]).prefault(
        null,
      ),
      EndUserRoleName: zodQuery([
        EndUserRoleSchema.shape.EndUserRoleName,
      ]).prefault(null),
      ReadAsset: zodQuery([EndUserRoleSchema.shape.ReadAsset]).prefault(null),
      ReadAssetFix: zodQuery([EndUserRoleSchema.shape.ReadAssetFix]).prefault(
        null,
      ),
      ReadAssetIssue: zodQuery([
        EndUserRoleSchema.shape.ReadAssetIssue,
      ]).prefault(null),
      ReadBuilding: zodQuery([EndUserRoleSchema.shape.ReadBuilding]).prefault(
        null,
      ),
      ReadCategory: zodQuery([EndUserRoleSchema.shape.ReadCategory]).prefault(
        null,
      ),
      ReadCompany: zodQuery([EndUserRoleSchema.shape.ReadCompany]).prefault(
        null,
      ),
      ReadDepartment: zodQuery([
        EndUserRoleSchema.shape.ReadDepartment,
      ]).prefault(null),
      ReadEmployee: zodQuery([EndUserRoleSchema.shape.ReadEmployee]).prefault(
        null,
      ),
      ReadEndUser: zodQuery([EndUserRoleSchema.shape.ReadEndUser]).prefault(
        null,
      ),
      ReadEndUserRole: zodQuery([
        EndUserRoleSchema.shape.ReadEndUserRole,
      ]).prefault(null),
      ReadLocation: zodQuery([EndUserRoleSchema.shape.ReadLocation]).prefault(
        null,
      ),
      ReadLog: zodQuery([EndUserRoleSchema.shape.ReadLog]).prefault(null),
      ReadManufacturer: zodQuery([
        EndUserRoleSchema.shape.ReadManufacturer,
      ]).prefault(null),
      ReadProduct: zodQuery([EndUserRoleSchema.shape.ReadProduct]).prefault(
        null,
      ),
      ReadProductSet: zodQuery([
        EndUserRoleSchema.shape.ReadProductSet,
      ]).prefault(null),
      ReadRole: zodQuery([EndUserRoleSchema.shape.ReadRole]).prefault(null),
      ReadVendor: zodQuery([EndUserRoleSchema.shape.ReadVendor]).prefault(null),
      UpdateAsset: zodQuery([EndUserRoleSchema.shape.UpdateAsset]).prefault(
        null,
      ),
      UpdateAssetFix: zodQuery([
        EndUserRoleSchema.shape.UpdateAssetFix,
      ]).prefault(null),
      UpdateAssetIssue: zodQuery([
        EndUserRoleSchema.shape.UpdateAssetIssue,
      ]).prefault(null),
      UpdateBuilding: zodQuery([
        EndUserRoleSchema.shape.UpdateBuilding,
      ]).prefault(null),
      UpdateCategory: zodQuery([
        EndUserRoleSchema.shape.UpdateCategory,
      ]).prefault(null),
      UpdateCompany: zodQuery([EndUserRoleSchema.shape.UpdateCompany]).prefault(
        null,
      ),
      UpdateDepartment: zodQuery([
        EndUserRoleSchema.shape.UpdateDepartment,
      ]).prefault(null),
      UpdateEmployee: zodQuery([
        EndUserRoleSchema.shape.UpdateEmployee,
      ]).prefault(null),
      UpdateEndUser: zodQuery([EndUserRoleSchema.shape.UpdateEndUser]).prefault(
        null,
      ),
      UpdateEndUserRole: zodQuery([
        EndUserRoleSchema.shape.UpdateEndUserRole,
      ]).prefault(null),
      UpdateLocation: zodQuery([
        EndUserRoleSchema.shape.UpdateLocation,
      ]).prefault(null),
      UpdateManufacturer: zodQuery([
        EndUserRoleSchema.shape.UpdateManufacturer,
      ]).prefault(null),
      UpdateProduct: zodQuery([EndUserRoleSchema.shape.UpdateProduct]).prefault(
        null,
      ),
      UpdateProductSet: zodQuery([
        EndUserRoleSchema.shape.UpdateProductSet,
      ]).prefault(null),
      UpdateRole: zodQuery([EndUserRoleSchema.shape.UpdateRole]).prefault(null),
      UpdateVendor: zodQuery([EndUserRoleSchema.shape.UpdateVendor]).prefault(
        null,
      ),
    })
    .safeExtend({
      FromEndUserRoleCreationDate: zodQuery([
        zodParseDate(EndUserRoleSchema.shape.EndUserRoleCreationDate),
      ]).prefault(null),
      NewestRowsFirst: zodQuery([zodParseNumber(TSQL_BIT_SCHEMA)]).prefault(
        null,
      ),
      RowsToReturn: zodQuery([zodParseNumber(TSQL_INT_SCHEMA.min(1))]).prefault(
        null,
      ),
      RowsToSkip: zodQuery([zodParseNumber(TSQL_INT_SCHEMA.min(0))]).prefault(
        null,
      ),
      ToEndUserRoleCreationDate: zodQuery([
        zodParseDate(EndUserRoleSchema.shape.EndUserRoleCreationDate),
      ]).prefault(null),
    })
    .safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ExpressError(z.prettifyError(parsedQuery.error), 400);
  }

  const {
    CreateAsset,
    CreateAssetFix,
    CreateAssetIssue,
    CreateBuilding,
    CreateCategory,
    CreateCompany,
    CreateDepartment,
    CreateEmployee,
    CreateEndUser,
    CreateEndUserRole,
    CreateLocation,
    CreateManufacturer,
    CreateProduct,
    CreateProductSet,
    CreateRole,
    CreateVendor,
    DeleteAsset,
    DeleteAssetFix,
    DeleteAssetIssue,
    DeleteBuilding,
    DeleteCategory,
    DeleteCompany,
    DeleteDepartment,
    DeleteEmployee,
    DeleteEndUser,
    DeleteEndUserRole,
    DeleteLocation,
    DeleteLog,
    DeleteManufacturer,
    DeleteProduct,
    DeleteProductSet,
    DeleteRole,
    DeleteVendor,
    EndUserRoleName,
    FromEndUserRoleCreationDate,
    NewestRowsFirst,
    ReadAsset,
    ReadAssetFix,
    ReadAssetIssue,
    ReadBuilding,
    ReadCategory,
    ReadCompany,
    ReadDepartment,
    ReadEmployee,
    ReadEndUser,
    ReadEndUserRole,
    ReadLocation,
    ReadLog,
    ReadManufacturer,
    ReadProduct,
    ReadProductSet,
    ReadRole,
    ReadVendor,
    RowsToReturn,
    RowsToSkip,
    ToEndUserRoleCreationDate,
    UpdateAsset,
    UpdateAssetFix,
    UpdateAssetIssue,
    UpdateBuilding,
    UpdateCategory,
    UpdateCompany,
    UpdateDepartment,
    UpdateEmployee,
    UpdateEndUser,
    UpdateEndUserRole,
    UpdateLocation,
    UpdateManufacturer,
    UpdateProduct,
    UpdateProductSet,
    UpdateRole,
    UpdateVendor,
  } = parsedQuery.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserRoleName", sql.NVarChar(850), EndUserRoleName)
    .input("CreateAsset", sql.Bit, CreateAsset)
    .input("CreateAssetFix", sql.Bit, CreateAssetFix)
    .input("CreateAssetIssue", sql.Bit, CreateAssetIssue)
    .input("CreateBuilding", sql.Bit, CreateBuilding)
    .input("CreateCategory", sql.Bit, CreateCategory)
    .input("CreateCompany", sql.Bit, CreateCompany)
    .input("CreateDepartment", sql.Bit, CreateDepartment)
    .input("CreateEmployee", sql.Bit, CreateEmployee)
    .input("CreateEndUser", sql.Bit, CreateEndUser)
    .input("CreateEndUserRole", sql.Bit, CreateEndUserRole)
    .input("CreateLocation", sql.Bit, CreateLocation)
    .input("CreateManufacturer", sql.Bit, CreateManufacturer)
    .input("CreateProduct", sql.Bit, CreateProduct)
    .input("CreateProductSet", sql.Bit, CreateProductSet)
    .input("CreateRole", sql.Bit, CreateRole)
    .input("CreateVendor", sql.Bit, CreateVendor)
    .input("ReadAsset", sql.Bit, ReadAsset)
    .input("ReadAssetFix", sql.Bit, ReadAssetFix)
    .input("ReadAssetIssue", sql.Bit, ReadAssetIssue)
    .input("ReadBuilding", sql.Bit, ReadBuilding)
    .input("ReadCategory", sql.Bit, ReadCategory)
    .input("ReadCompany", sql.Bit, ReadCompany)
    .input("ReadDepartment", sql.Bit, ReadDepartment)
    .input("ReadEmployee", sql.Bit, ReadEmployee)
    .input("ReadEndUser", sql.Bit, ReadEndUser)
    .input("ReadEndUserRole", sql.Bit, ReadEndUserRole)
    .input("ReadLocation", sql.Bit, ReadLocation)
    .input("ReadLog", sql.Bit, ReadLog)
    .input("ReadManufacturer", sql.Bit, ReadManufacturer)
    .input("ReadProduct", sql.Bit, ReadProduct)
    .input("ReadProductSet", sql.Bit, ReadProductSet)
    .input("ReadRole", sql.Bit, ReadRole)
    .input("ReadVendor", sql.Bit, ReadVendor)
    .input("UpdateAsset", sql.Bit, UpdateAsset)
    .input("UpdateAssetFix", sql.Bit, UpdateAssetFix)
    .input("UpdateAssetIssue", sql.Bit, UpdateAssetIssue)
    .input("UpdateBuilding", sql.Bit, UpdateBuilding)
    .input("UpdateCategory", sql.Bit, UpdateCategory)
    .input("UpdateCompany", sql.Bit, UpdateCompany)
    .input("UpdateDepartment", sql.Bit, UpdateDepartment)
    .input("UpdateEmployee", sql.Bit, UpdateEmployee)
    .input("UpdateEndUser", sql.Bit, UpdateEndUser)
    .input("UpdateEndUserRole", sql.Bit, UpdateEndUserRole)
    .input("UpdateLocation", sql.Bit, UpdateLocation)
    .input("UpdateManufacturer", sql.Bit, UpdateManufacturer)
    .input("UpdateProduct", sql.Bit, UpdateProduct)
    .input("UpdateProductSet", sql.Bit, UpdateProductSet)
    .input("UpdateRole", sql.Bit, UpdateRole)
    .input("UpdateVendor", sql.Bit, UpdateVendor)
    .input("DeleteAsset", sql.Bit, DeleteAsset)
    .input("DeleteAssetFix", sql.Bit, DeleteAssetFix)
    .input("DeleteAssetIssue", sql.Bit, DeleteAssetIssue)
    .input("DeleteBuilding", sql.Bit, DeleteBuilding)
    .input("DeleteCategory", sql.Bit, DeleteCategory)
    .input("DeleteCompany", sql.Bit, DeleteCompany)
    .input("DeleteDepartment", sql.Bit, DeleteDepartment)
    .input("DeleteEmployee", sql.Bit, DeleteEmployee)
    .input("DeleteEndUser", sql.Bit, DeleteEndUser)
    .input("DeleteEndUserRole", sql.Bit, DeleteEndUserRole)
    .input("DeleteLocation", sql.Bit, DeleteLocation)
    .input("DeleteLog", sql.Bit, DeleteLog)
    .input("DeleteManufacturer", sql.Bit, DeleteManufacturer)
    .input("DeleteProduct", sql.Bit, DeleteProduct)
    .input("DeleteProductSet", sql.Bit, DeleteProductSet)
    .input("DeleteRole", sql.Bit, DeleteRole)
    .input("DeleteVendor", sql.Bit, DeleteVendor)
    .input(
      "FromEndUserRoleCreationDate",
      sql.DateTimeOffset(3),
      FromEndUserRoleCreationDate,
    )
    .input(
      "ToEndUserRoleCreationDate",
      sql.DateTimeOffset(3),
      ToEndUserRoleCreationDate,
    )
    .input("RowsToSkip", sql.Int, RowsToSkip)
    .input("RowsToReturn", sql.Int, RowsToReturn)
    .input("NewestRowsFirst", sql.Bit, NewestRowsFirst)
    .execute<EndUserRole>(USP_READ_ENDUSERROLE)
    .then(({ recordset }) => {
      const parsedRecordset = EndUserRoleSchema.extend({
        CreateAsset: zodParseBitFromBoolean,
        CreateAssetFix: zodParseBitFromBoolean,
        CreateAssetIssue: zodParseBitFromBoolean,
        CreateBuilding: zodParseBitFromBoolean,
        CreateCategory: zodParseBitFromBoolean,
        CreateCompany: zodParseBitFromBoolean,
        CreateDepartment: zodParseBitFromBoolean,
        CreateEmployee: zodParseBitFromBoolean,
        CreateEndUser: zodParseBitFromBoolean,
        CreateEndUserRole: zodParseBitFromBoolean,
        CreateLocation: zodParseBitFromBoolean,
        CreateManufacturer: zodParseBitFromBoolean,
        CreateProduct: zodParseBitFromBoolean,
        CreateProductSet: zodParseBitFromBoolean,
        CreateRole: zodParseBitFromBoolean,
        CreateVendor: zodParseBitFromBoolean,
        DeleteAsset: zodParseBitFromBoolean,
        DeleteAssetFix: zodParseBitFromBoolean,
        DeleteAssetIssue: zodParseBitFromBoolean,
        DeleteBuilding: zodParseBitFromBoolean,
        DeleteCategory: zodParseBitFromBoolean,
        DeleteCompany: zodParseBitFromBoolean,
        DeleteDepartment: zodParseBitFromBoolean,
        DeleteEmployee: zodParseBitFromBoolean,
        DeleteEndUser: zodParseBitFromBoolean,
        DeleteEndUserRole: zodParseBitFromBoolean,
        DeleteLocation: zodParseBitFromBoolean,
        DeleteLog: zodParseBitFromBoolean,
        DeleteManufacturer: zodParseBitFromBoolean,
        DeleteProduct: zodParseBitFromBoolean,
        DeleteProductSet: zodParseBitFromBoolean,
        DeleteRole: zodParseBitFromBoolean,
        DeleteVendor: zodParseBitFromBoolean,
        ReadAsset: zodParseBitFromBoolean,
        ReadAssetFix: zodParseBitFromBoolean,
        ReadAssetIssue: zodParseBitFromBoolean,
        ReadBuilding: zodParseBitFromBoolean,
        ReadCategory: zodParseBitFromBoolean,
        ReadCompany: zodParseBitFromBoolean,
        ReadDepartment: zodParseBitFromBoolean,
        ReadEmployee: zodParseBitFromBoolean,
        ReadEndUser: zodParseBitFromBoolean,
        ReadEndUserRole: zodParseBitFromBoolean,
        ReadLocation: zodParseBitFromBoolean,
        ReadLog: zodParseBitFromBoolean,
        ReadManufacturer: zodParseBitFromBoolean,
        ReadProduct: zodParseBitFromBoolean,
        ReadProductSet: zodParseBitFromBoolean,
        ReadRole: zodParseBitFromBoolean,
        ReadVendor: zodParseBitFromBoolean,
        UpdateAsset: zodParseBitFromBoolean,
        UpdateAssetFix: zodParseBitFromBoolean,
        UpdateAssetIssue: zodParseBitFromBoolean,
        UpdateBuilding: zodParseBitFromBoolean,
        UpdateCategory: zodParseBitFromBoolean,
        UpdateCompany: zodParseBitFromBoolean,
        UpdateDepartment: zodParseBitFromBoolean,
        UpdateEmployee: zodParseBitFromBoolean,
        UpdateEndUser: zodParseBitFromBoolean,
        UpdateEndUserRole: zodParseBitFromBoolean,
        UpdateLocation: zodParseBitFromBoolean,
        UpdateManufacturer: zodParseBitFromBoolean,
        UpdateProduct: zodParseBitFromBoolean,
        UpdateProductSet: zodParseBitFromBoolean,
        UpdateRole: zodParseBitFromBoolean,
        UpdateVendor: zodParseBitFromBoolean,
      })
        .array()
        .safeParse(recordset);

      if (!parsedRecordset.success) {
        throw new ExpressError(z.prettifyError(parsedRecordset.error), 500);
      }

      res.json(parsedRecordset.data);
    })
    .catch((error: unknown) => {
      storedProcedureEnd = storedProcedureEnd ?? new Date();
      storedProcedureSuccess = 0;

      if (error instanceof Error) {
        throw error;
      }
    })
    .finally(async () => {
      await usp_CreateLog(
        req.app.locals.database,
        CallingEndUserID,
        req.ip ?? null,
        storedProcedureStart,
        storedProcedureEnd,
        storedProcedureSuccess,
        USP_READ_ENDUSERROLE,
        JSON.stringify({ CallingEndUserID, ...parsedQuery.data }),
      );
    });
};

export const updateEndUserRole = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = EndUserRoleSchema.pick({
    EndUserRoleID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { EndUserRoleID } = parsedParams.data;

  const parsedBody = EndUserRoleSchema.omit({
    EndUserRoleCreationDate: true,
    EndUserRoleID: true,
  })
    .extend({
      CreateAsset:
        EndUserRoleSchema.shape.CreateAsset.nullable().prefault(null),
      CreateAssetFix:
        EndUserRoleSchema.shape.CreateAssetFix.nullable().prefault(null),
      CreateAssetIssue:
        EndUserRoleSchema.shape.CreateAssetIssue.nullable().prefault(null),
      CreateBuilding:
        EndUserRoleSchema.shape.CreateBuilding.nullable().prefault(null),
      CreateCategory:
        EndUserRoleSchema.shape.CreateCategory.nullable().prefault(null),
      CreateCompany:
        EndUserRoleSchema.shape.CreateCompany.nullable().prefault(null),
      CreateDepartment:
        EndUserRoleSchema.shape.CreateDepartment.nullable().prefault(null),
      CreateEmployee:
        EndUserRoleSchema.shape.CreateEmployee.nullable().prefault(null),
      CreateEndUser:
        EndUserRoleSchema.shape.CreateEndUser.nullable().prefault(null),
      CreateEndUserRole:
        EndUserRoleSchema.shape.CreateEndUserRole.nullable().prefault(null),
      CreateLocation:
        EndUserRoleSchema.shape.CreateLocation.nullable().prefault(null),
      CreateManufacturer:
        EndUserRoleSchema.shape.CreateManufacturer.nullable().prefault(null),
      CreateProduct:
        EndUserRoleSchema.shape.CreateProduct.nullable().prefault(null),
      CreateProductSet:
        EndUserRoleSchema.shape.CreateProductSet.nullable().prefault(null),
      CreateRole: EndUserRoleSchema.shape.CreateRole.nullable().prefault(null),
      CreateVendor:
        EndUserRoleSchema.shape.CreateVendor.nullable().prefault(null),
      DeleteAsset:
        EndUserRoleSchema.shape.DeleteAsset.nullable().prefault(null),
      DeleteAssetFix:
        EndUserRoleSchema.shape.DeleteAssetFix.nullable().prefault(null),
      DeleteAssetIssue:
        EndUserRoleSchema.shape.DeleteAssetIssue.nullable().prefault(null),
      DeleteBuilding:
        EndUserRoleSchema.shape.DeleteBuilding.nullable().prefault(null),
      DeleteCategory:
        EndUserRoleSchema.shape.DeleteCategory.nullable().prefault(null),
      DeleteCompany:
        EndUserRoleSchema.shape.DeleteCompany.nullable().prefault(null),
      DeleteDepartment:
        EndUserRoleSchema.shape.DeleteDepartment.nullable().prefault(null),
      DeleteEmployee:
        EndUserRoleSchema.shape.DeleteEmployee.nullable().prefault(null),
      DeleteEndUser:
        EndUserRoleSchema.shape.DeleteEndUser.nullable().prefault(null),
      DeleteEndUserRole:
        EndUserRoleSchema.shape.DeleteEndUserRole.nullable().prefault(null),
      DeleteLocation:
        EndUserRoleSchema.shape.DeleteLocation.nullable().prefault(null),
      DeleteLog: EndUserRoleSchema.shape.DeleteLog.nullable().prefault(null),
      DeleteManufacturer:
        EndUserRoleSchema.shape.DeleteManufacturer.nullable().prefault(null),
      DeleteProduct:
        EndUserRoleSchema.shape.DeleteProduct.nullable().prefault(null),
      DeleteProductSet:
        EndUserRoleSchema.shape.DeleteProductSet.nullable().prefault(null),
      DeleteRole: EndUserRoleSchema.shape.DeleteRole.nullable().prefault(null),
      DeleteVendor:
        EndUserRoleSchema.shape.DeleteVendor.nullable().prefault(null),
      EndUserRoleName:
        EndUserRoleSchema.shape.EndUserRoleName.nullable().prefault(null),
      ReadAsset: EndUserRoleSchema.shape.ReadAsset.nullable().prefault(null),
      ReadAssetFix:
        EndUserRoleSchema.shape.ReadAssetFix.nullable().prefault(null),
      ReadAssetIssue:
        EndUserRoleSchema.shape.ReadAssetIssue.nullable().prefault(null),
      ReadBuilding:
        EndUserRoleSchema.shape.ReadBuilding.nullable().prefault(null),
      ReadCategory:
        EndUserRoleSchema.shape.ReadCategory.nullable().prefault(null),
      ReadCompany:
        EndUserRoleSchema.shape.ReadCompany.nullable().prefault(null),
      ReadDepartment:
        EndUserRoleSchema.shape.ReadDepartment.nullable().prefault(null),
      ReadEmployee:
        EndUserRoleSchema.shape.ReadEmployee.nullable().prefault(null),
      ReadEndUser:
        EndUserRoleSchema.shape.ReadEndUser.nullable().prefault(null),
      ReadEndUserRole:
        EndUserRoleSchema.shape.ReadEndUserRole.nullable().prefault(null),
      ReadLocation:
        EndUserRoleSchema.shape.ReadLocation.nullable().prefault(null),
      ReadLog: EndUserRoleSchema.shape.ReadLog.nullable().prefault(null),
      ReadManufacturer:
        EndUserRoleSchema.shape.ReadManufacturer.nullable().prefault(null),
      ReadProduct:
        EndUserRoleSchema.shape.ReadProduct.nullable().prefault(null),
      ReadProductSet:
        EndUserRoleSchema.shape.ReadProductSet.nullable().prefault(null),
      ReadRole: EndUserRoleSchema.shape.ReadRole.nullable().prefault(null),
      ReadVendor: EndUserRoleSchema.shape.ReadVendor.nullable().prefault(null),
      UpdateAsset:
        EndUserRoleSchema.shape.UpdateAsset.nullable().prefault(null),
      UpdateAssetFix:
        EndUserRoleSchema.shape.UpdateAssetFix.nullable().prefault(null),
      UpdateAssetIssue:
        EndUserRoleSchema.shape.UpdateAssetIssue.nullable().prefault(null),
      UpdateBuilding:
        EndUserRoleSchema.shape.UpdateBuilding.nullable().prefault(null),
      UpdateCategory:
        EndUserRoleSchema.shape.UpdateCategory.nullable().prefault(null),
      UpdateCompany:
        EndUserRoleSchema.shape.UpdateCompany.nullable().prefault(null),
      UpdateDepartment:
        EndUserRoleSchema.shape.UpdateDepartment.nullable().prefault(null),
      UpdateEmployee:
        EndUserRoleSchema.shape.UpdateEmployee.nullable().prefault(null),
      UpdateEndUser:
        EndUserRoleSchema.shape.UpdateEndUser.nullable().prefault(null),
      UpdateEndUserRole:
        EndUserRoleSchema.shape.UpdateEndUserRole.nullable().prefault(null),
      UpdateLocation:
        EndUserRoleSchema.shape.UpdateLocation.nullable().prefault(null),
      UpdateManufacturer:
        EndUserRoleSchema.shape.UpdateManufacturer.nullable().prefault(null),
      UpdateProduct:
        EndUserRoleSchema.shape.UpdateProduct.nullable().prefault(null),
      UpdateProductSet:
        EndUserRoleSchema.shape.UpdateProductSet.nullable().prefault(null),
      UpdateRole: EndUserRoleSchema.shape.UpdateRole.nullable().prefault(null),
      UpdateVendor:
        EndUserRoleSchema.shape.UpdateVendor.nullable().prefault(null),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const {
    CreateAsset,
    CreateAssetFix,
    CreateAssetIssue,
    CreateBuilding,
    CreateCategory,
    CreateCompany,
    CreateDepartment,
    CreateEmployee,
    CreateEndUser,
    CreateEndUserRole,
    CreateLocation,
    CreateManufacturer,
    CreateProduct,
    CreateProductSet,
    CreateRole,
    CreateVendor,
    DeleteAsset,
    DeleteAssetFix,
    DeleteAssetIssue,
    DeleteBuilding,
    DeleteCategory,
    DeleteCompany,
    DeleteDepartment,
    DeleteEmployee,
    DeleteEndUser,
    DeleteEndUserRole,
    DeleteLocation,
    DeleteLog,
    DeleteManufacturer,
    DeleteProduct,
    DeleteProductSet,
    DeleteRole,
    DeleteVendor,
    EndUserRoleName,
    ReadAsset,
    ReadAssetFix,
    ReadAssetIssue,
    ReadBuilding,
    ReadCategory,
    ReadCompany,
    ReadDepartment,
    ReadEmployee,
    ReadEndUser,
    ReadEndUserRole,
    ReadLocation,
    ReadLog,
    ReadManufacturer,
    ReadProduct,
    ReadProductSet,
    ReadRole,
    ReadVendor,
    UpdateAsset,
    UpdateAssetFix,
    UpdateAssetIssue,
    UpdateBuilding,
    UpdateCategory,
    UpdateCompany,
    UpdateDepartment,
    UpdateEmployee,
    UpdateEndUser,
    UpdateEndUserRole,
    UpdateLocation,
    UpdateManufacturer,
    UpdateProduct,
    UpdateProductSet,
    UpdateRole,
    UpdateVendor,
  } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserRoleID", sql.UniqueIdentifier, EndUserRoleID)
    .input("EndUserRoleName", sql.NVarChar(850), EndUserRoleName)
    .input("CreateAsset", sql.Bit, CreateAsset)
    .input("CreateAssetFix", sql.Bit, CreateAssetFix)
    .input("CreateAssetIssue", sql.Bit, CreateAssetIssue)
    .input("CreateBuilding", sql.Bit, CreateBuilding)
    .input("CreateCategory", sql.Bit, CreateCategory)
    .input("CreateCompany", sql.Bit, CreateCompany)
    .input("CreateDepartment", sql.Bit, CreateDepartment)
    .input("CreateEmployee", sql.Bit, CreateEmployee)
    .input("CreateEndUser", sql.Bit, CreateEndUser)
    .input("CreateEndUserRole", sql.Bit, CreateEndUserRole)
    .input("CreateLocation", sql.Bit, CreateLocation)
    .input("CreateManufacturer", sql.Bit, CreateManufacturer)
    .input("CreateProduct", sql.Bit, CreateProduct)
    .input("CreateProductSet", sql.Bit, CreateProductSet)
    .input("CreateRole", sql.Bit, CreateRole)
    .input("CreateVendor", sql.Bit, CreateVendor)
    .input("ReadAsset", sql.Bit, ReadAsset)
    .input("ReadAssetFix", sql.Bit, ReadAssetFix)
    .input("ReadAssetIssue", sql.Bit, ReadAssetIssue)
    .input("ReadBuilding", sql.Bit, ReadBuilding)
    .input("ReadCategory", sql.Bit, ReadCategory)
    .input("ReadCompany", sql.Bit, ReadCompany)
    .input("ReadDepartment", sql.Bit, ReadDepartment)
    .input("ReadEmployee", sql.Bit, ReadEmployee)
    .input("ReadEndUser", sql.Bit, ReadEndUser)
    .input("ReadEndUserRole", sql.Bit, ReadEndUserRole)
    .input("ReadLocation", sql.Bit, ReadLocation)
    .input("ReadLog", sql.Bit, ReadLog)
    .input("ReadManufacturer", sql.Bit, ReadManufacturer)
    .input("ReadProduct", sql.Bit, ReadProduct)
    .input("ReadProductSet", sql.Bit, ReadProductSet)
    .input("ReadRole", sql.Bit, ReadRole)
    .input("ReadVendor", sql.Bit, ReadVendor)
    .input("UpdateAsset", sql.Bit, UpdateAsset)
    .input("UpdateAssetFix", sql.Bit, UpdateAssetFix)
    .input("UpdateAssetIssue", sql.Bit, UpdateAssetIssue)
    .input("UpdateBuilding", sql.Bit, UpdateBuilding)
    .input("UpdateCategory", sql.Bit, UpdateCategory)
    .input("UpdateCompany", sql.Bit, UpdateCompany)
    .input("UpdateDepartment", sql.Bit, UpdateDepartment)
    .input("UpdateEmployee", sql.Bit, UpdateEmployee)
    .input("UpdateEndUser", sql.Bit, UpdateEndUser)
    .input("UpdateEndUserRole", sql.Bit, UpdateEndUserRole)
    .input("UpdateLocation", sql.Bit, UpdateLocation)
    .input("UpdateManufacturer", sql.Bit, UpdateManufacturer)
    .input("UpdateProduct", sql.Bit, UpdateProduct)
    .input("UpdateProductSet", sql.Bit, UpdateProductSet)
    .input("UpdateRole", sql.Bit, UpdateRole)
    .input("UpdateVendor", sql.Bit, UpdateVendor)
    .input("DeleteAsset", sql.Bit, DeleteAsset)
    .input("DeleteAssetFix", sql.Bit, DeleteAssetFix)
    .input("DeleteAssetIssue", sql.Bit, DeleteAssetIssue)
    .input("DeleteBuilding", sql.Bit, DeleteBuilding)
    .input("DeleteCategory", sql.Bit, DeleteCategory)
    .input("DeleteCompany", sql.Bit, DeleteCompany)
    .input("DeleteDepartment", sql.Bit, DeleteDepartment)
    .input("DeleteEmployee", sql.Bit, DeleteEmployee)
    .input("DeleteEndUser", sql.Bit, DeleteEndUser)
    .input("DeleteEndUserRole", sql.Bit, DeleteEndUserRole)
    .input("DeleteLocation", sql.Bit, DeleteLocation)
    .input("DeleteLog", sql.Bit, DeleteLog)
    .input("DeleteManufacturer", sql.Bit, DeleteManufacturer)
    .input("DeleteProduct", sql.Bit, DeleteProduct)
    .input("DeleteProductSet", sql.Bit, DeleteProductSet)
    .input("DeleteRole", sql.Bit, DeleteRole)
    .input("DeleteVendor", sql.Bit, DeleteVendor)
    .execute<EndUserRole>(USP_UPDATE_ENDUSERROLE)
    .then(({ recordset }) => {
      const parsedRecordset = EndUserRoleSchema.extend({
        CreateAsset: zodParseBitFromBoolean,
        CreateAssetFix: zodParseBitFromBoolean,
        CreateAssetIssue: zodParseBitFromBoolean,
        CreateBuilding: zodParseBitFromBoolean,
        CreateCategory: zodParseBitFromBoolean,
        CreateCompany: zodParseBitFromBoolean,
        CreateDepartment: zodParseBitFromBoolean,
        CreateEmployee: zodParseBitFromBoolean,
        CreateEndUser: zodParseBitFromBoolean,
        CreateEndUserRole: zodParseBitFromBoolean,
        CreateLocation: zodParseBitFromBoolean,
        CreateManufacturer: zodParseBitFromBoolean,
        CreateProduct: zodParseBitFromBoolean,
        CreateProductSet: zodParseBitFromBoolean,
        CreateRole: zodParseBitFromBoolean,
        CreateVendor: zodParseBitFromBoolean,
        DeleteAsset: zodParseBitFromBoolean,
        DeleteAssetFix: zodParseBitFromBoolean,
        DeleteAssetIssue: zodParseBitFromBoolean,
        DeleteBuilding: zodParseBitFromBoolean,
        DeleteCategory: zodParseBitFromBoolean,
        DeleteCompany: zodParseBitFromBoolean,
        DeleteDepartment: zodParseBitFromBoolean,
        DeleteEmployee: zodParseBitFromBoolean,
        DeleteEndUser: zodParseBitFromBoolean,
        DeleteEndUserRole: zodParseBitFromBoolean,
        DeleteLocation: zodParseBitFromBoolean,
        DeleteLog: zodParseBitFromBoolean,
        DeleteManufacturer: zodParseBitFromBoolean,
        DeleteProduct: zodParseBitFromBoolean,
        DeleteProductSet: zodParseBitFromBoolean,
        DeleteRole: zodParseBitFromBoolean,
        DeleteVendor: zodParseBitFromBoolean,
        OldCreateAsset: zodParseBitFromBoolean,
        OldCreateAssetFix: zodParseBitFromBoolean,
        OldCreateAssetIssue: zodParseBitFromBoolean,
        OldCreateBuilding: zodParseBitFromBoolean,
        OldCreateCategory: zodParseBitFromBoolean,
        OldCreateCompany: zodParseBitFromBoolean,
        OldCreateDepartment: zodParseBitFromBoolean,
        OldCreateEmployee: zodParseBitFromBoolean,
        OldCreateEndUser: zodParseBitFromBoolean,
        OldCreateEndUserRole: zodParseBitFromBoolean,
        OldCreateLocation: zodParseBitFromBoolean,
        OldCreateManufacturer: zodParseBitFromBoolean,
        OldCreateProduct: zodParseBitFromBoolean,
        OldCreateProductSet: zodParseBitFromBoolean,
        OldCreateRole: zodParseBitFromBoolean,
        OldCreateVendor: zodParseBitFromBoolean,
        OldDeleteAsset: zodParseBitFromBoolean,
        OldDeleteAssetFix: zodParseBitFromBoolean,
        OldDeleteAssetIssue: zodParseBitFromBoolean,
        OldDeleteBuilding: zodParseBitFromBoolean,
        OldDeleteCategory: zodParseBitFromBoolean,
        OldDeleteCompany: zodParseBitFromBoolean,
        OldDeleteDepartment: zodParseBitFromBoolean,
        OldDeleteEmployee: zodParseBitFromBoolean,
        OldDeleteEndUser: zodParseBitFromBoolean,
        OldDeleteEndUserRole: zodParseBitFromBoolean,
        OldDeleteLocation: zodParseBitFromBoolean,
        OldDeleteLog: zodParseBitFromBoolean,
        OldDeleteManufacturer: zodParseBitFromBoolean,
        OldDeleteProduct: zodParseBitFromBoolean,
        OldDeleteProductSet: zodParseBitFromBoolean,
        OldDeleteRole: zodParseBitFromBoolean,
        OldDeleteVendor: zodParseBitFromBoolean,
        OldEndUserRoleName: zodParseBitFromBoolean,
        OldReadAsset: zodParseBitFromBoolean,
        OldReadAssetFix: zodParseBitFromBoolean,
        OldReadAssetIssue: zodParseBitFromBoolean,
        OldReadBuilding: zodParseBitFromBoolean,
        OldReadCategory: zodParseBitFromBoolean,
        OldReadCompany: zodParseBitFromBoolean,
        OldReadDepartment: zodParseBitFromBoolean,
        OldReadEmployee: zodParseBitFromBoolean,
        OldReadEndUser: zodParseBitFromBoolean,
        OldReadEndUserRole: zodParseBitFromBoolean,
        OldReadLocation: zodParseBitFromBoolean,
        OldReadLog: zodParseBitFromBoolean,
        OldReadManufacturer: zodParseBitFromBoolean,
        OldReadProduct: zodParseBitFromBoolean,
        OldReadProductSet: zodParseBitFromBoolean,
        OldReadRole: zodParseBitFromBoolean,
        OldReadVendor: zodParseBitFromBoolean,
        OldUpdateAsset: zodParseBitFromBoolean,
        OldUpdateAssetFix: zodParseBitFromBoolean,
        OldUpdateAssetIssue: zodParseBitFromBoolean,
        OldUpdateBuilding: zodParseBitFromBoolean,
        OldUpdateCategory: zodParseBitFromBoolean,
        OldUpdateCompany: zodParseBitFromBoolean,
        OldUpdateDepartment: zodParseBitFromBoolean,
        OldUpdateEmployee: zodParseBitFromBoolean,
        OldUpdateEndUser: zodParseBitFromBoolean,
        OldUpdateEndUserRole: zodParseBitFromBoolean,
        OldUpdateLocation: zodParseBitFromBoolean,
        OldUpdateManufacturer: zodParseBitFromBoolean,
        OldUpdateProduct: zodParseBitFromBoolean,
        OldUpdateProductSet: zodParseBitFromBoolean,
        OldUpdateRole: zodParseBitFromBoolean,
        OldUpdateVendor: zodParseBitFromBoolean,
        ReadAsset: zodParseBitFromBoolean,
        ReadAssetFix: zodParseBitFromBoolean,
        ReadAssetIssue: zodParseBitFromBoolean,
        ReadBuilding: zodParseBitFromBoolean,
        ReadCategory: zodParseBitFromBoolean,
        ReadCompany: zodParseBitFromBoolean,
        ReadDepartment: zodParseBitFromBoolean,
        ReadEmployee: zodParseBitFromBoolean,
        ReadEndUser: zodParseBitFromBoolean,
        ReadEndUserRole: zodParseBitFromBoolean,
        ReadLocation: zodParseBitFromBoolean,
        ReadLog: zodParseBitFromBoolean,
        ReadManufacturer: zodParseBitFromBoolean,
        ReadProduct: zodParseBitFromBoolean,
        ReadProductSet: zodParseBitFromBoolean,
        ReadRole: zodParseBitFromBoolean,
        ReadVendor: zodParseBitFromBoolean,
        UpdateAsset: zodParseBitFromBoolean,
        UpdateAssetFix: zodParseBitFromBoolean,
        UpdateAssetIssue: zodParseBitFromBoolean,
        UpdateBuilding: zodParseBitFromBoolean,
        UpdateCategory: zodParseBitFromBoolean,
        UpdateCompany: zodParseBitFromBoolean,
        UpdateDepartment: zodParseBitFromBoolean,
        UpdateEmployee: zodParseBitFromBoolean,
        UpdateEndUser: zodParseBitFromBoolean,
        UpdateEndUserRole: zodParseBitFromBoolean,
        UpdateLocation: zodParseBitFromBoolean,
        UpdateManufacturer: zodParseBitFromBoolean,
        UpdateProduct: zodParseBitFromBoolean,
        UpdateProductSet: zodParseBitFromBoolean,
        UpdateRole: zodParseBitFromBoolean,
        UpdateVendor: zodParseBitFromBoolean,
      })
        .array()
        .max(1)
        .safeParse(recordset);

      if (!parsedRecordset.success) {
        throw new ExpressError(z.prettifyError(parsedRecordset.error), 500);
      }

      res.json(parsedRecordset.data[0]);
    })
    .catch((error: unknown) => {
      storedProcedureEnd = storedProcedureEnd ?? new Date();
      storedProcedureSuccess = 0;

      if (error instanceof Error) {
        throw error;
      }
    })
    .finally(async () => {
      await usp_CreateLog(
        req.app.locals.database,
        CallingEndUserID,
        req.ip ?? null,
        storedProcedureStart,
        storedProcedureEnd,
        storedProcedureSuccess,
        USP_UPDATE_ENDUSERROLE,
        JSON.stringify({
          CallingEndUserID,
          ...parsedParams.data,
          ...parsedBody.data,
        }),
      );
    });
};

export const deleteEndUserRole = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = EndUserRoleSchema.pick({
    EndUserRoleID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { EndUserRoleID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserRoleID", sql.UniqueIdentifier, EndUserRoleID)
    .execute<EndUserRole>(USP_DELETE_ENDUSERROLE)
    .then(({ recordset }) => {
      const parsedRecordset = EndUserRoleSchema.extend({
        CreateAsset: zodParseBitFromBoolean,
        CreateAssetFix: zodParseBitFromBoolean,
        CreateAssetIssue: zodParseBitFromBoolean,
        CreateBuilding: zodParseBitFromBoolean,
        CreateCategory: zodParseBitFromBoolean,
        CreateCompany: zodParseBitFromBoolean,
        CreateDepartment: zodParseBitFromBoolean,
        CreateEmployee: zodParseBitFromBoolean,
        CreateEndUser: zodParseBitFromBoolean,
        CreateEndUserRole: zodParseBitFromBoolean,
        CreateLocation: zodParseBitFromBoolean,
        CreateManufacturer: zodParseBitFromBoolean,
        CreateProduct: zodParseBitFromBoolean,
        CreateProductSet: zodParseBitFromBoolean,
        CreateRole: zodParseBitFromBoolean,
        CreateVendor: zodParseBitFromBoolean,
        DeleteAsset: zodParseBitFromBoolean,
        DeleteAssetFix: zodParseBitFromBoolean,
        DeleteAssetIssue: zodParseBitFromBoolean,
        DeleteBuilding: zodParseBitFromBoolean,
        DeleteCategory: zodParseBitFromBoolean,
        DeleteCompany: zodParseBitFromBoolean,
        DeleteDepartment: zodParseBitFromBoolean,
        DeleteEmployee: zodParseBitFromBoolean,
        DeleteEndUser: zodParseBitFromBoolean,
        DeleteEndUserRole: zodParseBitFromBoolean,
        DeleteLocation: zodParseBitFromBoolean,
        DeleteLog: zodParseBitFromBoolean,
        DeleteManufacturer: zodParseBitFromBoolean,
        DeleteProduct: zodParseBitFromBoolean,
        DeleteProductSet: zodParseBitFromBoolean,
        DeleteRole: zodParseBitFromBoolean,
        DeleteVendor: zodParseBitFromBoolean,
        ReadAsset: zodParseBitFromBoolean,
        ReadAssetFix: zodParseBitFromBoolean,
        ReadAssetIssue: zodParseBitFromBoolean,
        ReadBuilding: zodParseBitFromBoolean,
        ReadCategory: zodParseBitFromBoolean,
        ReadCompany: zodParseBitFromBoolean,
        ReadDepartment: zodParseBitFromBoolean,
        ReadEmployee: zodParseBitFromBoolean,
        ReadEndUser: zodParseBitFromBoolean,
        ReadEndUserRole: zodParseBitFromBoolean,
        ReadLocation: zodParseBitFromBoolean,
        ReadLog: zodParseBitFromBoolean,
        ReadManufacturer: zodParseBitFromBoolean,
        ReadProduct: zodParseBitFromBoolean,
        ReadProductSet: zodParseBitFromBoolean,
        ReadRole: zodParseBitFromBoolean,
        ReadVendor: zodParseBitFromBoolean,
        UpdateAsset: zodParseBitFromBoolean,
        UpdateAssetFix: zodParseBitFromBoolean,
        UpdateAssetIssue: zodParseBitFromBoolean,
        UpdateBuilding: zodParseBitFromBoolean,
        UpdateCategory: zodParseBitFromBoolean,
        UpdateCompany: zodParseBitFromBoolean,
        UpdateDepartment: zodParseBitFromBoolean,
        UpdateEmployee: zodParseBitFromBoolean,
        UpdateEndUser: zodParseBitFromBoolean,
        UpdateEndUserRole: zodParseBitFromBoolean,
        UpdateLocation: zodParseBitFromBoolean,
        UpdateManufacturer: zodParseBitFromBoolean,
        UpdateProduct: zodParseBitFromBoolean,
        UpdateProductSet: zodParseBitFromBoolean,
        UpdateRole: zodParseBitFromBoolean,
        UpdateVendor: zodParseBitFromBoolean,
      })
        .array()
        .max(1)
        .safeParse(recordset);

      if (!parsedRecordset.success) {
        throw new ExpressError(z.prettifyError(parsedRecordset.error), 500);
      }

      res.json(parsedRecordset.data[0]);
    })
    .catch((error: unknown) => {
      storedProcedureEnd = storedProcedureEnd ?? new Date();
      storedProcedureSuccess = 0;

      if (error instanceof Error) {
        throw error;
      }
    })
    .finally(async () => {
      await usp_CreateLog(
        req.app.locals.database,
        CallingEndUserID,
        req.ip ?? null,
        storedProcedureStart,
        storedProcedureEnd,
        storedProcedureSuccess,
        USP_DELETE_ENDUSERROLE,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};
