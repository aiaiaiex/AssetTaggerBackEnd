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
import { zodParseDate, zodParseNumber, zodQuery } from "../utils/zodUtils";
import { usp_CreateLog } from "./logController";

export const createEndUserRole = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedBody = EndUserRoleSchema.omit({
    EndUserRoleCreationDate: true,
    EndUserRoleID: true,
  })
    .extend({
      CreateAsset: EndUserRoleSchema.shape.CreateAsset.optional().prefault(0),
      CreateAssetFix:
        EndUserRoleSchema.shape.CreateAssetFix.optional().prefault(0),
      CreateAssetIssue:
        EndUserRoleSchema.shape.CreateAssetIssue.optional().prefault(0),
      CreateBuilding:
        EndUserRoleSchema.shape.CreateBuilding.optional().prefault(0),
      CreateCategory:
        EndUserRoleSchema.shape.CreateCategory.optional().prefault(0),
      CreateCompany:
        EndUserRoleSchema.shape.CreateCompany.optional().prefault(0),
      CreateDepartment:
        EndUserRoleSchema.shape.CreateDepartment.optional().prefault(0),
      CreateEmployee:
        EndUserRoleSchema.shape.CreateEmployee.optional().prefault(0),
      CreateEndUser:
        EndUserRoleSchema.shape.CreateEndUser.optional().prefault(0),
      CreateEndUserRole:
        EndUserRoleSchema.shape.CreateEndUserRole.optional().prefault(0),
      CreateLocation:
        EndUserRoleSchema.shape.CreateLocation.optional().prefault(0),
      CreateManufacturer:
        EndUserRoleSchema.shape.CreateManufacturer.optional().prefault(0),
      CreateProduct:
        EndUserRoleSchema.shape.CreateProduct.optional().prefault(0),
      CreateProductSet:
        EndUserRoleSchema.shape.CreateProductSet.optional().prefault(0),
      CreateRole: EndUserRoleSchema.shape.CreateRole.optional().prefault(0),
      CreateVendor: EndUserRoleSchema.shape.CreateVendor.optional().prefault(0),
      DeleteAsset: EndUserRoleSchema.shape.DeleteAsset.optional().prefault(0),
      DeleteAssetFix:
        EndUserRoleSchema.shape.DeleteAssetFix.optional().prefault(0),
      DeleteAssetIssue:
        EndUserRoleSchema.shape.DeleteAssetIssue.optional().prefault(0),
      DeleteBuilding:
        EndUserRoleSchema.shape.DeleteBuilding.optional().prefault(0),
      DeleteCategory:
        EndUserRoleSchema.shape.DeleteCategory.optional().prefault(0),
      DeleteCompany:
        EndUserRoleSchema.shape.DeleteCompany.optional().prefault(0),
      DeleteDepartment:
        EndUserRoleSchema.shape.DeleteDepartment.optional().prefault(0),
      DeleteEmployee:
        EndUserRoleSchema.shape.DeleteEmployee.optional().prefault(0),
      DeleteEndUser:
        EndUserRoleSchema.shape.DeleteEndUser.optional().prefault(0),
      DeleteEndUserRole:
        EndUserRoleSchema.shape.DeleteEndUserRole.optional().prefault(0),
      DeleteLocation:
        EndUserRoleSchema.shape.DeleteLocation.optional().prefault(0),
      DeleteLog: EndUserRoleSchema.shape.DeleteLog.optional().prefault(0),
      DeleteManufacturer:
        EndUserRoleSchema.shape.DeleteManufacturer.optional().prefault(0),
      DeleteProduct:
        EndUserRoleSchema.shape.DeleteProduct.optional().prefault(0),
      DeleteProductSet:
        EndUserRoleSchema.shape.DeleteProductSet.optional().prefault(0),
      DeleteRole: EndUserRoleSchema.shape.DeleteRole.optional().prefault(0),
      DeleteVendor: EndUserRoleSchema.shape.DeleteVendor.optional().prefault(0),
      ReadAsset: EndUserRoleSchema.shape.ReadAsset.optional().prefault(0),
      ReadAssetFix: EndUserRoleSchema.shape.ReadAssetFix.optional().prefault(0),
      ReadAssetIssue:
        EndUserRoleSchema.shape.ReadAssetIssue.optional().prefault(0),
      ReadBuilding: EndUserRoleSchema.shape.ReadBuilding.optional().prefault(0),
      ReadCategory: EndUserRoleSchema.shape.ReadCategory.optional().prefault(0),
      ReadCompany: EndUserRoleSchema.shape.ReadCompany.optional().prefault(0),
      ReadDepartment:
        EndUserRoleSchema.shape.ReadDepartment.optional().prefault(0),
      ReadEmployee: EndUserRoleSchema.shape.ReadEmployee.optional().prefault(0),
      ReadEndUser: EndUserRoleSchema.shape.ReadEndUser.optional().prefault(0),
      ReadEndUserRole:
        EndUserRoleSchema.shape.ReadEndUserRole.optional().prefault(0),
      ReadLocation: EndUserRoleSchema.shape.ReadLocation.optional().prefault(0),
      ReadLog: EndUserRoleSchema.shape.ReadLog.optional().prefault(0),
      ReadManufacturer:
        EndUserRoleSchema.shape.ReadManufacturer.optional().prefault(0),
      ReadProduct: EndUserRoleSchema.shape.ReadProduct.optional().prefault(0),
      ReadProductSet:
        EndUserRoleSchema.shape.ReadProductSet.optional().prefault(0),
      ReadRole: EndUserRoleSchema.shape.ReadRole.optional().prefault(0),
      ReadVendor: EndUserRoleSchema.shape.ReadVendor.optional().prefault(0),
      UpdateAsset: EndUserRoleSchema.shape.UpdateAsset.optional().prefault(0),
      UpdateAssetFix:
        EndUserRoleSchema.shape.UpdateAssetFix.optional().prefault(0),
      UpdateAssetIssue:
        EndUserRoleSchema.shape.UpdateAssetIssue.optional().prefault(0),
      UpdateBuilding:
        EndUserRoleSchema.shape.UpdateBuilding.optional().prefault(0),
      UpdateCategory:
        EndUserRoleSchema.shape.UpdateCategory.optional().prefault(0),
      UpdateCompany:
        EndUserRoleSchema.shape.UpdateCompany.optional().prefault(0),
      UpdateDepartment:
        EndUserRoleSchema.shape.UpdateDepartment.optional().prefault(0),
      UpdateEmployee:
        EndUserRoleSchema.shape.UpdateEmployee.optional().prefault(0),
      UpdateEndUser:
        EndUserRoleSchema.shape.UpdateEndUser.optional().prefault(0),
      UpdateEndUserRole:
        EndUserRoleSchema.shape.UpdateEndUserRole.optional().prefault(0),
      UpdateLocation:
        EndUserRoleSchema.shape.UpdateLocation.optional().prefault(0),
      UpdateManufacturer:
        EndUserRoleSchema.shape.UpdateManufacturer.optional().prefault(0),
      UpdateProduct:
        EndUserRoleSchema.shape.UpdateProduct.optional().prefault(0),
      UpdateProductSet:
        EndUserRoleSchema.shape.UpdateProductSet.optional().prefault(0),
      UpdateRole: EndUserRoleSchema.shape.UpdateRole.optional().prefault(0),
      UpdateVendor: EndUserRoleSchema.shape.UpdateVendor.optional().prefault(0),
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
      const parsedRecordset = EndUserRoleSchema.array()
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
      const parsedRecordset = EndUserRoleSchema.array()
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
      const parsedRecordset = EndUserRoleSchema.array().safeParse(recordset);

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
      const parsedRecordset = EndUserRoleSchema.safeExtend({
        OldCreateAsset: EndUserRoleSchema.shape.CreateAsset,
        OldCreateAssetFix: EndUserRoleSchema.shape.CreateAssetFix,
        OldCreateAssetIssue: EndUserRoleSchema.shape.CreateAssetIssue,
        OldCreateBuilding: EndUserRoleSchema.shape.CreateBuilding,
        OldCreateCategory: EndUserRoleSchema.shape.CreateCategory,
        OldCreateCompany: EndUserRoleSchema.shape.CreateCompany,
        OldCreateDepartment: EndUserRoleSchema.shape.CreateDepartment,
        OldCreateEmployee: EndUserRoleSchema.shape.CreateEmployee,
        OldCreateEndUser: EndUserRoleSchema.shape.CreateEndUser,
        OldCreateEndUserRole: EndUserRoleSchema.shape.CreateEndUserRole,
        OldCreateLocation: EndUserRoleSchema.shape.CreateLocation,
        OldCreateManufacturer: EndUserRoleSchema.shape.CreateManufacturer,
        OldCreateProduct: EndUserRoleSchema.shape.CreateProduct,
        OldCreateProductSet: EndUserRoleSchema.shape.CreateProductSet,
        OldCreateRole: EndUserRoleSchema.shape.CreateRole,
        OldCreateVendor: EndUserRoleSchema.shape.CreateVendor,
        OldDeleteAsset: EndUserRoleSchema.shape.DeleteAsset,
        OldDeleteAssetFix: EndUserRoleSchema.shape.DeleteAssetFix,
        OldDeleteAssetIssue: EndUserRoleSchema.shape.DeleteAssetIssue,
        OldDeleteBuilding: EndUserRoleSchema.shape.DeleteBuilding,
        OldDeleteCategory: EndUserRoleSchema.shape.DeleteCategory,
        OldDeleteCompany: EndUserRoleSchema.shape.DeleteCompany,
        OldDeleteDepartment: EndUserRoleSchema.shape.DeleteDepartment,
        OldDeleteEmployee: EndUserRoleSchema.shape.DeleteEmployee,
        OldDeleteEndUser: EndUserRoleSchema.shape.DeleteEndUser,
        OldDeleteEndUserRole: EndUserRoleSchema.shape.DeleteEndUserRole,
        OldDeleteLocation: EndUserRoleSchema.shape.DeleteLocation,
        OldDeleteLog: EndUserRoleSchema.shape.DeleteLog,
        OldDeleteManufacturer: EndUserRoleSchema.shape.DeleteManufacturer,
        OldDeleteProduct: EndUserRoleSchema.shape.DeleteProduct,
        OldDeleteProductSet: EndUserRoleSchema.shape.DeleteProductSet,
        OldDeleteRole: EndUserRoleSchema.shape.DeleteRole,
        OldDeleteVendor: EndUserRoleSchema.shape.DeleteVendor,
        OldEndUserRoleName: EndUserRoleSchema.shape.EndUserRoleName,
        OldReadAsset: EndUserRoleSchema.shape.ReadAsset,
        OldReadAssetFix: EndUserRoleSchema.shape.ReadAssetFix,
        OldReadAssetIssue: EndUserRoleSchema.shape.ReadAssetIssue,
        OldReadBuilding: EndUserRoleSchema.shape.ReadBuilding,
        OldReadCategory: EndUserRoleSchema.shape.ReadCategory,
        OldReadCompany: EndUserRoleSchema.shape.ReadCompany,
        OldReadDepartment: EndUserRoleSchema.shape.ReadDepartment,
        OldReadEmployee: EndUserRoleSchema.shape.ReadEmployee,
        OldReadEndUser: EndUserRoleSchema.shape.ReadEndUser,
        OldReadEndUserRole: EndUserRoleSchema.shape.ReadEndUserRole,
        OldReadLocation: EndUserRoleSchema.shape.ReadLocation,
        OldReadLog: EndUserRoleSchema.shape.ReadLog,
        OldReadManufacturer: EndUserRoleSchema.shape.ReadManufacturer,
        OldReadProduct: EndUserRoleSchema.shape.ReadProduct,
        OldReadProductSet: EndUserRoleSchema.shape.ReadProductSet,
        OldReadRole: EndUserRoleSchema.shape.ReadRole,
        OldReadVendor: EndUserRoleSchema.shape.ReadVendor,
        OldUpdateAsset: EndUserRoleSchema.shape.UpdateAsset,
        OldUpdateAssetFix: EndUserRoleSchema.shape.UpdateAssetFix,
        OldUpdateAssetIssue: EndUserRoleSchema.shape.UpdateAssetIssue,
        OldUpdateBuilding: EndUserRoleSchema.shape.UpdateBuilding,
        OldUpdateCategory: EndUserRoleSchema.shape.UpdateCategory,
        OldUpdateCompany: EndUserRoleSchema.shape.UpdateCompany,
        OldUpdateDepartment: EndUserRoleSchema.shape.UpdateDepartment,
        OldUpdateEmployee: EndUserRoleSchema.shape.UpdateEmployee,
        OldUpdateEndUser: EndUserRoleSchema.shape.UpdateEndUser,
        OldUpdateEndUserRole: EndUserRoleSchema.shape.UpdateEndUserRole,
        OldUpdateLocation: EndUserRoleSchema.shape.UpdateLocation,
        OldUpdateManufacturer: EndUserRoleSchema.shape.UpdateManufacturer,
        OldUpdateProduct: EndUserRoleSchema.shape.UpdateProduct,
        OldUpdateProductSet: EndUserRoleSchema.shape.UpdateProductSet,
        OldUpdateRole: EndUserRoleSchema.shape.UpdateRole,
        OldUpdateVendor: EndUserRoleSchema.shape.UpdateVendor,
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
      const parsedRecordset = EndUserRoleSchema.array()
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
