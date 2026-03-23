import { Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import sql from "mssql";
import z from "zod";

import {
  USP_CREATE_EMPLOYEE,
  USP_DELETE_EMPLOYEE,
  USP_READ_EMPLOYEE,
  USP_UPDATE_EMPLOYEE,
} from "../constants/StoredProcedureConstants";
import {
  TSQL_BIT_SCHEMA,
  TSQL_INT_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { ExpressError } from "../middlewares/handleError";
import { Employee, EmployeeSchema } from "../models/Employee";
import { Log } from "../models/Log";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import { zodParseDate, zodParseNumber, zodQuery } from "../utils/zodUtils";
import { usp_CreateLog } from "./logController";

export const createEmployee = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedBody = EmployeeSchema.omit({
    EmployeeID: true,
    EmployeeInsertDate: true,
  }).safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const { CompanyID, DepartmentID, EmployeeFullName, RoleID } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EmployeeFullName", sql.NVarChar(850), EmployeeFullName)
    .input("RoleID", sql.UniqueIdentifier, RoleID)
    .input("CompanyID", sql.UniqueIdentifier, CompanyID)
    .input("DepartmentID", sql.UniqueIdentifier, DepartmentID)
    .execute<Employee>(USP_CREATE_EMPLOYEE)
    .then(({ recordset }) => {
      const parsedRecordset = EmployeeSchema.array()
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
        USP_CREATE_EMPLOYEE,
        JSON.stringify({ CallingEndUserID, ...parsedBody.data }),
      );
    });
};

export const readEmployee = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = EmployeeSchema.pick({
    EmployeeID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { EmployeeID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .execute<Employee>(USP_READ_EMPLOYEE)
    .then(({ recordset }) => {
      const parsedRecordset = EmployeeSchema.array()
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
        USP_READ_EMPLOYEE,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};

export const readEmployees = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedQuery = EmployeeSchema.omit({
    EmployeeID: true,
    EmployeeInsertDate: true,
  })
    .extend({
      CompanyID: zodQuery([EmployeeSchema.shape.CompanyID]).prefault(null),
      DepartmentID: zodQuery([EmployeeSchema.shape.DepartmentID]).prefault(
        null,
      ),
      EmployeeFullName: zodQuery([
        EmployeeSchema.shape.EmployeeFullName,
      ]).prefault(null),
      RoleID: zodQuery([EmployeeSchema.shape.RoleID]).prefault(null),
    })
    .safeExtend({
      FromEmployeeInsertDate: zodQuery([
        zodParseDate(EmployeeSchema.shape.EmployeeInsertDate),
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
      ToEmployeeInsertDate: zodQuery([
        zodParseDate(EmployeeSchema.shape.EmployeeInsertDate),
      ]).prefault(null),
    })
    .safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ExpressError(z.prettifyError(parsedQuery.error), 400);
  }

  const {
    CompanyID,
    DepartmentID,
    EmployeeFullName,
    FromEmployeeInsertDate,
    NewestRowsFirst,
    RoleID,
    RowsToReturn,
    RowsToSkip,
    ToEmployeeInsertDate,
  } = parsedQuery.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EmployeeFullName", sql.NVarChar(850), EmployeeFullName)
    .input("RoleID", sql.UniqueIdentifier, RoleID)
    .input("CompanyID", sql.UniqueIdentifier, CompanyID)
    .input("DepartmentID", sql.UniqueIdentifier, DepartmentID)
    .input(
      "FromEmployeeInsertDate",
      sql.DateTimeOffset(3),
      FromEmployeeInsertDate,
    )
    .input("ToEmployeeInsertDate", sql.DateTimeOffset(3), ToEmployeeInsertDate)
    .input("RowsToSkip", sql.Int, RowsToSkip)
    .input("RowsToReturn", sql.Int, RowsToReturn)
    .input("NewestRowsFirst", sql.Bit, NewestRowsFirst)
    .execute<Employee>(USP_READ_EMPLOYEE)
    .then(({ recordset }) => {
      const parsedRecordset = EmployeeSchema.array().safeParse(recordset);

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
        USP_READ_EMPLOYEE,
        JSON.stringify({ CallingEndUserID, ...parsedQuery.data }),
      );
    });
};

export const updateEmployee = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = EmployeeSchema.pick({
    EmployeeID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { EmployeeID } = parsedParams.data;

  const parsedBody = EmployeeSchema.omit({
    EmployeeID: true,
    EmployeeInsertDate: true,
  })
    .extend({
      CompanyID: EmployeeSchema.shape.CompanyID.nullable().prefault(null),
      DepartmentID: EmployeeSchema.shape.DepartmentID.nullable().prefault(null),
      EmployeeFullName:
        EmployeeSchema.shape.EmployeeFullName.nullable().prefault(null),
      RoleID: EmployeeSchema.shape.RoleID.nullable().prefault(null),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const { CompanyID, DepartmentID, EmployeeFullName, RoleID } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input("EmployeeFullName", sql.NVarChar(850), EmployeeFullName)
    .input("RoleID", sql.UniqueIdentifier, RoleID)
    .input("CompanyID", sql.UniqueIdentifier, CompanyID)
    .input("DepartmentID", sql.UniqueIdentifier, DepartmentID)
    .execute<Employee>(USP_UPDATE_EMPLOYEE)
    .then(({ recordset }) => {
      const parsedRecordset = EmployeeSchema.safeExtend({
        OldCompanyID: EmployeeSchema.shape.CompanyID,
        OldDepartmentID: EmployeeSchema.shape.DepartmentID,
        OldEmployeeFullName: EmployeeSchema.shape.EmployeeFullName,
        OldRoleID: EmployeeSchema.shape.RoleID,
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
        USP_UPDATE_EMPLOYEE,
        JSON.stringify({
          CallingEndUserID,
          ...parsedParams.data,
          ...parsedBody.data,
        }),
      );
    });
};

export const deleteEmployee = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = EmployeeSchema.pick({
    EmployeeID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { EmployeeID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .execute<Employee>(USP_DELETE_EMPLOYEE)
    .then(({ recordset }) => {
      const parsedRecordset = EmployeeSchema.array()
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
        USP_DELETE_EMPLOYEE,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};
