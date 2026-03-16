import { Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import sql from "mssql";
import z from "zod";

import { NonNullishConstantsSchema } from "../constants/NonNullishConstants";
import {
  NULLISH_NVARCHAR,
  NullishConstantsSchema,
} from "../constants/NullishConstants";
import {
  USP_CREATE_LOG,
  USP_DELETE_LOG,
  USP_READ_LOG,
} from "../constants/StoredProceduresConstants";
import { ExpressError } from "../middlewares/handleError";
import { Log, LogSchema } from "../models/Log";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import {
  zodCombineUnionErrorMessages,
  zodParseNull,
  zodParseNumber,
} from "../utils/zodUtils";

export const usp_CreateLog = async (
  database: sql.ConnectionPool,
  CallingEndUserID: z.infer<typeof LogSchema.shape.EndUserID>,
  LogEndUserIP: z.infer<typeof LogSchema.shape.LogEndUserIP>,
  LogStoredProcedureStart: z.infer<
    typeof LogSchema.shape.LogStoredProcedureStart
  >,
  LogStoredProcedureEnd: z.infer<typeof LogSchema.shape.LogStoredProcedureEnd>,
  LogStoredProcedureSuccess: z.infer<
    typeof LogSchema.shape.LogStoredProcedureSuccess
  >,
  LogStoredProcedureName: z.infer<
    typeof LogSchema.shape.LogStoredProcedureName
  >,
  LogStoredProcedureParameters: z.infer<
    typeof LogSchema.shape.LogStoredProcedureParameters
  >,
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

  const storedProcedureStart = new Date();
  let storedProcedureEnd: Date;
  let storedProcedureSuccess = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("LogID", sql.UniqueIdentifier, LogID)
    .execute<Log>(USP_READ_LOG)
    .then(({ recordset }) => {
      storedProcedureEnd = new Date();

      const parsedRecordset = LogSchema.extend({
        LogStoredProcedureSuccess: z
          .boolean()
          .transform((input): number => {
            return input ? 1 : 0;
          })
          .pipe(LogSchema.shape.LogStoredProcedureSuccess),
      })
        .array()
        .max(1)
        .safeParse(recordset);

      if (!parsedRecordset.success) {
        throw new ExpressError(z.prettifyError(parsedRecordset.error), 500);
      }

      res.json(parsedRecordset.data[0]);
    })
    .catch(() => {
      storedProcedureSuccess = 0;
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
        JSON.stringify(parsedParams.data),
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
      EndUserID: z
        .xor([zodParseNull(), LogSchema.shape.EndUserID], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      LogEndUserIP: z
        .xor(
          [
            zodParseNull(),
            LogSchema.shape.LogEndUserIP.unwrap(),
            NullishConstantsSchema.shape.NULLISH_NVARCHAR,
            NonNullishConstantsSchema.shape.NON_NULLISH_NVARCHAR,
          ],
          {
            error: zodCombineUnionErrorMessages,
          },
        )
        .prefault(NULLISH_NVARCHAR),
      LogStoredProcedureName: z
        .xor([zodParseNull(), LogSchema.shape.LogStoredProcedureName], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      LogStoredProcedureParameters: z
        .xor([zodParseNull(), LogSchema.shape.LogStoredProcedureParameters], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      LogStoredProcedureSuccess: z
        .xor([zodParseNull(), LogSchema.shape.LogStoredProcedureSuccess], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
    })
    .safeExtend({
      FromLogStoredProcedureEnd: z
        .xor([zodParseNull(), z.iso.datetime(), z.iso.date()], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      FromLogStoredProcedureMilliseconds: z
        .xor([zodParseNull(), LogSchema.shape.LogStoredProcedureMilliseconds], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      FromLogStoredProcedureStart: z
        .xor([zodParseNull(), z.iso.datetime(), z.iso.date()], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      // The maximum integer is 9,223,372,036,854,775,807 because it is the upper limit of BIGINT in T-SQL.
      // See more:
      // https://learn.microsoft.com/en-us/sql/t-sql/data-types/int-bigint-smallint-and-tinyint-transact-sql
      RowsToReturn: z
        .xor(
          [
            zodParseNumber(z.bigint().min(1n).max(9223372036854775807n)),
            zodParseNull(),
          ],
          {
            error: zodCombineUnionErrorMessages,
          },
        )
        .prefault(null),
      RowsToSkip: z
        .xor(
          [
            zodParseNumber(z.bigint().min(0n).max(9223372036854775807n)),
            zodParseNull(),
          ],
          {
            error: zodCombineUnionErrorMessages,
          },
        )
        .prefault(null),
      ToLogStoredProcedureEnd: z
        .xor([zodParseNull(), z.iso.datetime(), z.iso.date()], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      ToLogStoredProcedureMilliseconds: z
        .xor([zodParseNull(), LogSchema.shape.LogStoredProcedureMilliseconds], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      ToLogStoredProcedureStart: z
        .xor([zodParseNull(), z.iso.datetime(), z.iso.date()], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
    })
    .safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ExpressError(z.prettifyError(parsedQuery.error), 400);
  }

  const {
    FromLogStoredProcedureEnd,
    FromLogStoredProcedureMilliseconds,
    FromLogStoredProcedureStart,
    LogEndUserIP,
    LogStoredProcedureName,
    LogStoredProcedureParameters,
    LogStoredProcedureSuccess,
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

  const storedProcedureStart = new Date();
  let storedProcedureEnd: Date;
  let storedProcedureSuccess = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
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
      sql.BigInt,
      FromLogStoredProcedureMilliseconds,
    )
    .input(
      "ToLogStoredProcedureMilliseconds",
      sql.BigInt,
      ToLogStoredProcedureMilliseconds,
    )
    .input("RowsToSkip", sql.Int, RowsToSkip)
    .input("RowsToReturn", sql.Int, RowsToReturn)
    .execute<Log>(USP_READ_LOG)
    .then(({ recordset }) => {
      storedProcedureEnd = new Date();

      const parsedRecordset = LogSchema.extend({
        LogStoredProcedureSuccess: z
          .boolean()
          .transform((input): number => {
            return input ? 1 : 0;
          })
          .pipe(LogSchema.shape.LogStoredProcedureSuccess),
      })
        .array()
        .safeParse(recordset);

      if (!parsedRecordset.success) {
        throw new ExpressError(z.prettifyError(parsedRecordset.error), 500);
      }

      res.json(parsedRecordset.data);
    })
    .catch(() => {
      storedProcedureSuccess = 0;
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
        JSON.stringify(parsedQuery.data),
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

  const storedProcedureStart = new Date();
  let storedProcedureEnd: Date;
  let storedProcedureSuccess = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("LogID", sql.UniqueIdentifier, LogID)
    .execute<Log>(USP_DELETE_LOG)
    .then(({ recordset }) => {
      storedProcedureEnd = new Date();

      const parsedRecordset = LogSchema.extend({
        LogStoredProcedureSuccess: z
          .boolean()
          .transform((input): number => {
            return input ? 1 : 0;
          })
          .pipe(LogSchema.shape.LogStoredProcedureSuccess),
      })
        .array()
        .max(1)
        .safeParse(recordset);

      if (!parsedRecordset.success) {
        throw new ExpressError(z.prettifyError(parsedRecordset.error), 500);
      }

      res.json(parsedRecordset.data[0]);
    })
    .catch(() => {
      storedProcedureSuccess = 0;
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
        JSON.stringify(parsedParams.data),
      );
    });
};
