import { Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import sql from "mssql";
import z from "zod";

import { NonNullishConstantsSchema } from "../constants/NonNullishConstants";
import {
  NULLISH_UNIQUEIDENTIFIER,
  NullishConstantsSchema,
} from "../constants/NullishConstants";
import {
  USP_CREATE_COMPANY,
  USP_DELETE_COMPANY,
  USP_READ_COMPANY,
  USP_UPDATE_COMPANY,
} from "../constants/StoredProcedureConstants";
import {
  TSQL_BIT_SCHEMA,
  TSQL_INT_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { ExpressError } from "../middlewares/handleError";
import { Company, CompanySchema } from "../models/Company";
import { Log } from "../models/Log";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import {
  zodParseDate,
  zodParseNumber,
  zodQuery,
  zodXOR,
} from "../utils/zodUtils";
import { usp_CreateLog } from "./logController";

export const createCompany = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedBody = CompanySchema.omit({
    CompanyID: true,
    CompanyInsertDate: true,
  })
    .extend({
      ParentCompanyID: CompanySchema.shape.ParentCompanyID.prefault(null),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const { CompanyAddress, CompanyCode, CompanyName, ParentCompanyID } =
    parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("CompanyName", sql.NVarChar(850), CompanyName)
    .input("CompanyAddress", sql.NVarChar(850), CompanyAddress)
    .input("CompanyCode", sql.NVarChar(5), CompanyCode)
    .input("ParentCompanyID", sql.UniqueIdentifier, ParentCompanyID)
    .execute<Company>(USP_CREATE_COMPANY)
    .then(({ recordset }) => {
      const parsedRecordset = CompanySchema.array()
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
        USP_CREATE_COMPANY,
        JSON.stringify({ CallingEndUserID, ...parsedBody.data }),
      );
    });
};

export const readCompany = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = CompanySchema.pick({
    CompanyID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { CompanyID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("CompanyID", sql.UniqueIdentifier, CompanyID)
    .execute<Company>(USP_READ_COMPANY)
    .then(({ recordset }) => {
      const parsedRecordset = CompanySchema.array().max(1).safeParse(recordset);

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
        USP_READ_COMPANY,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};

export const readCompanies = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedQuery = CompanySchema.omit({
    CompanyID: true,
    CompanyInsertDate: true,
  })
    .extend({
      CompanyAddress: zodQuery([CompanySchema.shape.CompanyAddress]).prefault(
        null,
      ),
      CompanyCode: zodQuery([CompanySchema.shape.CompanyCode]).prefault(null),
      CompanyName: zodQuery([CompanySchema.shape.CompanyName]).prefault(null),
      ParentCompanyID: zodQuery([
        CompanySchema.shape.ParentCompanyID,
        NullishConstantsSchema.shape.NULLISH_UNIQUEIDENTIFIER,
        NonNullishConstantsSchema.shape.NON_NULLISH_UNIQUEIDENTIFIER,
      ]).prefault(NULLISH_UNIQUEIDENTIFIER),
    })
    .safeExtend({
      FromCompanyInsertDate: zodQuery([
        zodParseDate(CompanySchema.shape.CompanyInsertDate),
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
      ToCompanyInsertDate: zodQuery([
        zodParseDate(CompanySchema.shape.CompanyInsertDate),
      ]).prefault(null),
    })
    .safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ExpressError(z.prettifyError(parsedQuery.error), 400);
  }

  const {
    CompanyAddress,
    CompanyCode,
    CompanyName,
    FromCompanyInsertDate,
    NewestRowsFirst,
    ParentCompanyID,
    RowsToReturn,
    RowsToSkip,
    ToCompanyInsertDate,
  } = parsedQuery.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("CompanyName", sql.NVarChar(850), CompanyName)
    .input("CompanyAddress", sql.NVarChar(850), CompanyAddress)
    .input("CompanyCode", sql.NVarChar(5), CompanyCode)
    .input("ParentCompanyID", sql.UniqueIdentifier, ParentCompanyID)
    .input(
      "FromCompanyInsertDate",
      sql.DateTimeOffset(3),
      FromCompanyInsertDate,
    )
    .input("ToCompanyInsertDate", sql.DateTimeOffset(3), ToCompanyInsertDate)
    .input("RowsToSkip", sql.Int, RowsToSkip)
    .input("RowsToReturn", sql.Int, RowsToReturn)
    .input("NewestRowsFirst", sql.Bit, NewestRowsFirst)
    .execute<Company>(USP_READ_COMPANY)
    .then(({ recordset }) => {
      const parsedRecordset = CompanySchema.array().safeParse(recordset);

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
        USP_READ_COMPANY,
        JSON.stringify({ CallingEndUserID, ...parsedQuery.data }),
      );
    });
};

export const updateCompany = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = CompanySchema.pick({
    CompanyID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { CompanyID } = parsedParams.data;

  const parsedBody = CompanySchema.omit({
    CompanyID: true,
    CompanyInsertDate: true,
  })
    .extend({
      CompanyAddress:
        CompanySchema.shape.CompanyAddress.nullable().prefault(null),
      CompanyCode: CompanySchema.shape.CompanyCode.nullable().prefault(null),
      CompanyName: CompanySchema.shape.CompanyName.nullable().prefault(null),
      ParentCompanyID: zodXOR([
        CompanySchema.shape.ParentCompanyID,
        NullishConstantsSchema.shape.NULLISH_UNIQUEIDENTIFIER,
      ]).prefault(NULLISH_UNIQUEIDENTIFIER),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const { CompanyAddress, CompanyCode, CompanyName, ParentCompanyID } =
    parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("CompanyID", sql.UniqueIdentifier, CompanyID)
    .input("CompanyName", sql.NVarChar(850), CompanyName)
    .input("CompanyAddress", sql.NVarChar(850), CompanyAddress)
    .input("CompanyCode", sql.NVarChar(5), CompanyCode)
    .input("ParentCompanyID", sql.UniqueIdentifier, ParentCompanyID)
    .execute<Company>(USP_UPDATE_COMPANY)
    .then(({ recordset }) => {
      const parsedRecordset = CompanySchema.safeExtend({
        OldCompanyAddress: CompanySchema.shape.CompanyAddress,
        OldCompanyCode: CompanySchema.shape.CompanyCode,
        OldCompanyName: CompanySchema.shape.CompanyName,
        OldParentCompanyID: CompanySchema.shape.ParentCompanyID,
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
        USP_UPDATE_COMPANY,
        JSON.stringify({
          CallingEndUserID,
          ...parsedParams.data,
          ...parsedBody.data,
        }),
      );
    });
};

export const deleteCompany = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = CompanySchema.pick({
    CompanyID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { CompanyID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("CompanyID", sql.UniqueIdentifier, CompanyID)
    .execute<Company>(USP_DELETE_COMPANY)
    .then(({ recordset }) => {
      const parsedRecordset = CompanySchema.array().max(1).safeParse(recordset);

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
        USP_DELETE_COMPANY,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};
