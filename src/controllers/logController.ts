import { Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import sql from "mssql";
import z from "zod";

import { NonNullishConstantsSchema } from "../constants/NonNullishConstants";
import {
  NULLISH_NVARCHAR,
  NULLISH_UNIQUEIDENTIFIER,
  NullishConstantsSchema,
} from "../constants/NullishConstants";
import {
  USP_CREATE_LOG,
  USP_DELETE_LOG,
  USP_READ_LOG,
} from "../constants/StoredProceduresConstants";
import {
  BOOLEAN_TO_MSSQL_BIT_SCHEMA,
  MSSQL_BIGINT_SCHEMA,
  MSSQL_BIT_SCHEMA,
} from "../constants/ZodConstants";
import { ExpressError } from "../middlewares/handleError";
import { Log, LogSchema } from "../models/Log";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import { bigIntReplacer } from "../utils/jsonUtils";
import { zodParseBigInt, zodParseNumber, zodQuery } from "../utils/zodUtils";

export const usp_CreateLog = async (
  database: sql.ConnectionPool,
  CallingEndUserID: Log["EndUserID"],
  LogEndUserIP: Log["LogEndUserIP"],
  LogStoredProcedureStart: Log["LogStoredProcedureStart"],
  LogStoredProcedureEnd: Log["LogStoredProcedureEnd"] = new Date(),
  LogStoredProcedureSuccess: Log["LogStoredProcedureSuccess"],
  LogStoredProcedureName: Log["LogStoredProcedureName"],
  LogStoredProcedureParameters: Log["LogStoredProcedureParameters"],
) => {
  await database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("LogEndUserIP", sql.NVarChar(4000), LogEndUserIP)
    .input("LogStoredProcedureStart", sql.DateTime, LogStoredProcedureStart)
    .input("LogStoredProcedureEnd", sql.DateTime, LogStoredProcedureEnd)
    .input("LogStoredProcedureSuccess", sql.Bit, LogStoredProcedureSuccess)
    .input("LogStoredProcedureName", sql.NVarChar(4000), LogStoredProcedureName)
    .input(
      "LogStoredProcedureParameters",
      sql.NVarChar(sql.MAX),
      LogStoredProcedureParameters,
    )
    .execute<Log>(USP_CREATE_LOG);
};

export const readLog = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = LogSchema.pick({
    LogID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { LogID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("LogID", sql.UniqueIdentifier, LogID)
    .execute<Log>(USP_READ_LOG)
    .then(({ recordset }) => {
      storedProcedureEnd = new Date();

      const parsedRecordset = LogSchema.extend({
        LogStoredProcedureSuccess: BOOLEAN_TO_MSSQL_BIT_SCHEMA,
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
        USP_READ_LOG,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};

export const readLogs = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedQuery = LogSchema.omit({
    LogID: true,
    LogStoredProcedureEnd: true,
    LogStoredProcedureMilliseconds: true,
    LogStoredProcedureStart: true,
  })
    .extend({
      EndUserID: zodQuery([
        LogSchema.shape.EndUserID.unwrap(),
        NullishConstantsSchema.shape.NULLISH_UNIQUEIDENTIFIER,
        NonNullishConstantsSchema.shape.NON_NULLISH_UNIQUEIDENTIFIER,
      ]).prefault(NULLISH_UNIQUEIDENTIFIER),
      LogEndUserIP: zodQuery([
        LogSchema.shape.LogEndUserIP.unwrap(),
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
        NonNullishConstantsSchema.shape.NON_NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      LogStoredProcedureName: zodQuery([
        LogSchema.shape.LogStoredProcedureName,
      ]).prefault(null),
      LogStoredProcedureParameters: zodQuery([
        LogSchema.shape.LogStoredProcedureParameters,
      ]).prefault(null),
      LogStoredProcedureSuccess: zodQuery([
        LogSchema.shape.LogStoredProcedureSuccess,
      ]).prefault(null),
    })
    .safeExtend({
      FromLogStoredProcedureEnd: zodQuery([
        z.iso.datetime(),
        z.iso.date(),
      ]).prefault(null),
      FromLogStoredProcedureMilliseconds: zodQuery([
        LogSchema.shape.LogStoredProcedureMilliseconds,
      ]).prefault(null),
      FromLogStoredProcedureStart: zodQuery([
        z.iso.datetime(),
        z.iso.date(),
      ]).prefault(null),
      NewestRowsFirst: zodQuery([zodParseNumber(MSSQL_BIT_SCHEMA)]).prefault(
        null,
      ),
      RowsToReturn: zodQuery([
        zodParseBigInt(MSSQL_BIGINT_SCHEMA.min(1n)),
      ]).prefault(null),
      RowsToSkip: zodQuery([
        zodParseBigInt(MSSQL_BIGINT_SCHEMA.min(0n)),
      ]).prefault(null),
      ToLogStoredProcedureEnd: zodQuery([
        z.iso.datetime(),
        z.iso.date(),
      ]).prefault(null),
      ToLogStoredProcedureMilliseconds: zodQuery([
        LogSchema.shape.LogStoredProcedureMilliseconds,
      ]).prefault(null),
      ToLogStoredProcedureStart: zodQuery([
        z.iso.datetime(),
        z.iso.date(),
      ]).prefault(null),
    })
    .safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ExpressError(z.prettifyError(parsedQuery.error), 400);
  }

  const {
    EndUserID,
    FromLogStoredProcedureEnd,
    FromLogStoredProcedureMilliseconds,
    FromLogStoredProcedureStart,
    LogEndUserIP,
    LogStoredProcedureName,
    LogStoredProcedureParameters,
    LogStoredProcedureSuccess,
    NewestRowsFirst,
    RowsToReturn,
    RowsToSkip,
    ToLogStoredProcedureEnd,
    ToLogStoredProcedureMilliseconds,
    ToLogStoredProcedureStart,
  } = parsedQuery.data;

  if (
    FromLogStoredProcedureStart !== null &&
    ToLogStoredProcedureStart !== null &&
    new Date(FromLogStoredProcedureStart) > new Date(ToLogStoredProcedureStart)
  ) {
    throw new ExpressError(
      "FromLogStoredProcedureStart cannot be later than ToLogStoredProcedureStart!",
      400,
    );
  }
  if (
    FromLogStoredProcedureEnd !== null &&
    ToLogStoredProcedureEnd !== null &&
    new Date(FromLogStoredProcedureEnd) > new Date(ToLogStoredProcedureEnd)
  ) {
    throw new ExpressError(
      "FromLogStoredProcedureEnd cannot be later than ToLogStoredProcedureEnd!",
      400,
    );
  }
  if (
    FromLogStoredProcedureMilliseconds !== null &&
    ToLogStoredProcedureMilliseconds !== null &&
    FromLogStoredProcedureMilliseconds > ToLogStoredProcedureMilliseconds
  ) {
    throw new ExpressError(
      "FromLogStoredProcedureMilliseconds cannot be greater than ToLogStoredProcedureMilliseconds!",
      400,
    );
  }

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserID", sql.UniqueIdentifier, EndUserID)
    .input("LogEndUserIP", sql.NVarChar(4000), LogEndUserIP)
    .input("LogStoredProcedureSuccess", sql.Bit, LogStoredProcedureSuccess)
    .input("LogStoredProcedureName", sql.NVarChar(4000), LogStoredProcedureName)
    .input(
      "LogStoredProcedureParameters",
      sql.NVarChar(sql.MAX),
      LogStoredProcedureParameters,
    )
    .input(
      "FromLogStoredProcedureStart",
      sql.DateTime,
      FromLogStoredProcedureStart,
    )
    .input("ToLogStoredProcedureStart", sql.DateTime, ToLogStoredProcedureStart)
    .input("FromLogStoredProcedureEnd", sql.DateTime, FromLogStoredProcedureEnd)
    .input("ToLogStoredProcedureEnd", sql.DateTime, ToLogStoredProcedureEnd)
    .input(
      "FromLogStoredProcedureMilliseconds",
      sql.Int,
      FromLogStoredProcedureMilliseconds,
    )
    .input(
      "ToLogStoredProcedureMilliseconds",
      sql.Int,
      ToLogStoredProcedureMilliseconds,
    )
    .input("RowsToSkip", sql.BigInt, RowsToSkip)
    .input("RowsToReturn", sql.BigInt, RowsToReturn)
    .input("NewestRowsFirst", sql.Bit, NewestRowsFirst)
    .execute<Log>(USP_READ_LOG)
    .then(({ recordset }) => {
      storedProcedureEnd = new Date();

      const parsedRecordset = LogSchema.extend({
        LogStoredProcedureSuccess: BOOLEAN_TO_MSSQL_BIT_SCHEMA,
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
        USP_READ_LOG,
        JSON.stringify(
          { CallingEndUserID, ...parsedQuery.data },
          bigIntReplacer,
        ),
      );
    });
};

export const deleteLog = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = LogSchema.pick({
    LogID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { LogID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("LogID", sql.UniqueIdentifier, LogID)
    .execute<Log>(USP_DELETE_LOG)
    .then(({ recordset }) => {
      storedProcedureEnd = new Date();

      const parsedRecordset = LogSchema.extend({
        LogStoredProcedureSuccess: BOOLEAN_TO_MSSQL_BIT_SCHEMA,
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
        USP_DELETE_LOG,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};
