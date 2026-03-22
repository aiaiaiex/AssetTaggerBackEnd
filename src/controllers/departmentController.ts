import { Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import sql from "mssql";
import z from "zod";

import {
  USP_CREATE_DEPARTMENT,
  USP_DELETE_DEPARTMENT,
  USP_READ_DEPARTMENT,
  USP_UPDATE_DEPARTMENT,
} from "../constants/StoredProcedureConstants";
import {
  TSQL_BIT_SCHEMA,
  TSQL_INT_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { ExpressError } from "../middlewares/handleError";
import { Department, DepartmentSchema } from "../models/Department";
import { Log } from "../models/Log";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import { zodParseDate, zodParseNumber, zodQuery } from "../utils/zodUtils";
import { usp_CreateLog } from "./logController";

export const createDepartment = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedBody = DepartmentSchema.omit({
    DepartmentID: true,
    DepartmentInsertDate: true,
  }).safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const { DepartmentName } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("DepartmentName", sql.NVarChar(850), DepartmentName)
    .execute<Department>(USP_CREATE_DEPARTMENT)
    .then(({ recordset }) => {
      const parsedRecordset = DepartmentSchema.array()
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
        USP_CREATE_DEPARTMENT,
        JSON.stringify({ CallingEndUserID, ...parsedBody.data }),
      );
    });
};

export const readDepartment = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = DepartmentSchema.pick({
    DepartmentID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { DepartmentID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("DepartmentID", sql.UniqueIdentifier, DepartmentID)
    .execute<Department>(USP_READ_DEPARTMENT)
    .then(({ recordset }) => {
      const parsedRecordset = DepartmentSchema.array()
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
        USP_READ_DEPARTMENT,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};

export const readDepartments = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedQuery = DepartmentSchema.omit({
    DepartmentID: true,
    DepartmentInsertDate: true,
  })
    .extend({
      DepartmentName: zodQuery([
        DepartmentSchema.shape.DepartmentName,
      ]).prefault(null),
    })
    .safeExtend({
      FromDepartmentInsertDate: zodQuery([
        zodParseDate(DepartmentSchema.shape.DepartmentInsertDate),
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
      ToDepartmentInsertDate: zodQuery([
        zodParseDate(DepartmentSchema.shape.DepartmentInsertDate),
      ]).prefault(null),
    })
    .safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ExpressError(z.prettifyError(parsedQuery.error), 400);
  }

  const {
    DepartmentName,
    FromDepartmentInsertDate,
    NewestRowsFirst,
    RowsToReturn,
    RowsToSkip,
    ToDepartmentInsertDate,
  } = parsedQuery.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("DepartmentName", sql.NVarChar(850), DepartmentName)
    .input(
      "FromDepartmentInsertDate",
      sql.DateTimeOffset(3),
      FromDepartmentInsertDate,
    )
    .input(
      "ToDepartmentInsertDate",
      sql.DateTimeOffset(3),
      ToDepartmentInsertDate,
    )
    .input("RowsToSkip", sql.Int, RowsToSkip)
    .input("RowsToReturn", sql.Int, RowsToReturn)
    .input("NewestRowsFirst", sql.Bit, NewestRowsFirst)
    .execute<Department>(USP_READ_DEPARTMENT)
    .then(({ recordset }) => {
      const parsedRecordset = DepartmentSchema.array().safeParse(recordset);

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
        USP_READ_DEPARTMENT,
        JSON.stringify({ CallingEndUserID, ...parsedQuery.data }),
      );
    });
};

export const updateDepartment = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = DepartmentSchema.pick({
    DepartmentID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { DepartmentID } = parsedParams.data;

  const parsedBody = DepartmentSchema.omit({
    DepartmentID: true,
    DepartmentInsertDate: true,
  })
    .extend({
      DepartmentName:
        DepartmentSchema.shape.DepartmentName.nullable().prefault(null),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const { DepartmentName } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("DepartmentID", sql.UniqueIdentifier, DepartmentID)
    .input("DepartmentName", sql.NVarChar(850), DepartmentName)
    .execute<Department>(USP_UPDATE_DEPARTMENT)
    .then(({ recordset }) => {
      const parsedRecordset = DepartmentSchema.safeExtend({
        OldDepartmentName: DepartmentSchema.shape.DepartmentName,
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
        USP_UPDATE_DEPARTMENT,
        JSON.stringify({
          CallingEndUserID,
          ...parsedParams.data,
          ...parsedBody.data,
        }),
      );
    });
};

export const deleteDepartment = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = DepartmentSchema.pick({
    DepartmentID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { DepartmentID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("DepartmentID", sql.UniqueIdentifier, DepartmentID)
    .execute<Department>(USP_DELETE_DEPARTMENT)
    .then(({ recordset }) => {
      const parsedRecordset = DepartmentSchema.array()
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
        USP_DELETE_DEPARTMENT,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};
