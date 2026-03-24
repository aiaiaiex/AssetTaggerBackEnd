import { Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import sql from "mssql";
import z from "zod";

import {
  NON_NULLISH_DATETIMEOFFSET_SCHEMA,
  NonNullishConstantsSchema,
} from "../constants/NonNullishConstants";
import {
  NULLISH_BIGINT,
  NULLISH_DATETIMEOFFSET,
  NULLISH_DATETIMEOFFSET_SCHEMA,
  NULLISH_DECIMAL,
  NULLISH_NVARCHAR,
  NullishConstantsSchema,
} from "../constants/NullishConstants";
import {
  USP_CREATE_ASSETFIX,
  USP_DELETE_ASSETFIX,
  USP_READ_ASSETFIX,
  USP_UPDATE_ASSETFIX,
} from "../constants/StoredProcedureConstants";
import {
  TSQL_BIT_SCHEMA,
  TSQL_INT_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { ExpressError } from "../middlewares/handleError";
import { AssetFix, AssetFixSchema } from "../models/AssetFix";
import { Log } from "../models/Log";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import { bigIntReplacer } from "../utils/jsonUtils";
import {
  zodParseBigInt,
  zodParseDate,
  zodParseNumber,
  zodQuery,
  zodXOR,
} from "../utils/zodUtils";
import { usp_CreateLog } from "./logController";

export const createAssetFix = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedBody = AssetFixSchema.omit({
    AssetFixDateDays: true,
    AssetFixID: true,
  })
    .extend({
      AssetFixCost: AssetFixSchema.shape.AssetFixCost.prefault(null),
      AssetFixDateEnd: zodParseDate(
        AssetFixSchema.shape.AssetFixDateEnd.unwrap(),
      )
        .nullable()
        .prefault(null),
      AssetFixDateStart: zodParseDate(AssetFixSchema.shape.AssetFixDateStart)
        .nullable()
        .prefault(null),
      AssetFixDescription:
        AssetFixSchema.shape.AssetFixDescription.prefault(null),
      AssetFixDocumentationURL:
        AssetFixSchema.shape.AssetFixDocumentationURL.prefault(null),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const {
    AssetFixCost,
    AssetFixDateEnd,
    AssetFixDateStart,
    AssetFixDescription,
    AssetFixDocumentationURL,
    AssetFixed,
    AssetFixTitle,
    AssetIssueID,
    EmployeeID,
  } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("AssetIssueID", sql.UniqueIdentifier, AssetIssueID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input("AssetFixDateStart", sql.DateTimeOffset(3), AssetFixDateStart)
    .input("AssetFixDateEnd", sql.DateTimeOffset(3), AssetFixDateEnd)
    .input("AssetFixTitle", sql.NVarChar(4000), AssetFixTitle)
    .input("AssetFixDescription", sql.NVarChar(sql.MAX), AssetFixDescription)
    .input(
      "AssetFixDocumentationURL",
      sql.NVarChar(4000),
      AssetFixDocumentationURL,
    )
    .input("AssetFixed", sql.Bit, AssetFixed)
    .input("AssetFixCost", sql.Decimal(15, 4), AssetFixCost)
    .execute<AssetFix>(USP_CREATE_ASSETFIX)
    .then(({ recordset }) => {
      const parsedRecordset = AssetFixSchema.array()
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
        USP_CREATE_ASSETFIX,
        JSON.stringify({ CallingEndUserID, ...parsedBody.data }),
      );
    });
};

export const readAssetFix = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = AssetFixSchema.pick({
    AssetFixID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { AssetFixID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("AssetFixID", sql.UniqueIdentifier, AssetFixID)
    .execute<AssetFix>(USP_READ_ASSETFIX)
    .then(({ recordset }) => {
      const parsedRecordset = AssetFixSchema.array()
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
        USP_READ_ASSETFIX,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};

export const readAssetFixes = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedQuery = AssetFixSchema.omit({
    AssetFixCost: true,
    AssetFixDateDays: true,
    AssetFixDateEnd: true,
    AssetFixDateStart: true,
    AssetFixID: true,
  })
    .extend({
      AssetFixDescription: zodQuery([
        AssetFixSchema.shape.AssetFixDescription,
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
        NonNullishConstantsSchema.shape.NON_NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      AssetFixDocumentationURL: zodQuery([
        AssetFixSchema.shape.AssetFixDocumentationURL,
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
        NonNullishConstantsSchema.shape.NON_NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      AssetFixed: zodQuery([AssetFixSchema.shape.AssetFixed]).prefault(null),
      AssetFixTitle: zodQuery([AssetFixSchema.shape.AssetFixTitle]).prefault(
        null,
      ),
      AssetIssueID: zodQuery([AssetFixSchema.shape.AssetIssueID]).prefault(
        null,
      ),
      EmployeeID: zodQuery([AssetFixSchema.shape.EmployeeID]).prefault(null),
    })
    .safeExtend({
      FromAssetFixCost: zodQuery([
        zodParseNumber(AssetFixSchema.shape.AssetFixCost.unwrap()),
        NullishConstantsSchema.shape.NULLISH_DECIMAL,
        NonNullishConstantsSchema.shape.NON_NULLISH_DECIMAL,
      ]).prefault(NULLISH_DECIMAL),
      FromAssetFixDateDays: zodQuery([
        zodParseBigInt(AssetFixSchema.shape.AssetFixDateDays.unwrap()),
        NullishConstantsSchema.shape.NULLISH_BIGINT,
        NonNullishConstantsSchema.shape.NON_NULLISH_BIGINT,
      ]).prefault(NULLISH_BIGINT),
      FromAssetFixDateEnd: zodQuery([
        zodParseDate(AssetFixSchema.shape.AssetFixDateEnd.unwrap()),
        NULLISH_DATETIMEOFFSET_SCHEMA,
        NON_NULLISH_DATETIMEOFFSET_SCHEMA,
      ]).prefault(NULLISH_DATETIMEOFFSET),
      FromAssetFixDateStart: zodQuery([
        zodParseDate(AssetFixSchema.shape.AssetFixDateStart),
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
      ToAssetFixCost: zodQuery([
        zodParseNumber(AssetFixSchema.shape.AssetFixCost.unwrap()),
        NullishConstantsSchema.shape.NULLISH_DECIMAL,
        NonNullishConstantsSchema.shape.NON_NULLISH_DECIMAL,
      ]).prefault(NULLISH_DECIMAL),
      ToAssetFixDateDays: zodQuery([
        zodParseBigInt(AssetFixSchema.shape.AssetFixDateDays.unwrap()),
        NullishConstantsSchema.shape.NULLISH_BIGINT,
        NonNullishConstantsSchema.shape.NON_NULLISH_BIGINT,
      ]).prefault(NULLISH_BIGINT),
      ToAssetFixDateEnd: zodQuery([
        zodParseDate(AssetFixSchema.shape.AssetFixDateEnd.unwrap()),
        NULLISH_DATETIMEOFFSET_SCHEMA,
        NON_NULLISH_DATETIMEOFFSET_SCHEMA,
      ]).prefault(NULLISH_DATETIMEOFFSET),
      ToAssetFixDateStart: zodQuery([
        zodParseDate(AssetFixSchema.shape.AssetFixDateStart),
      ]).prefault(null),
    })
    .safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ExpressError(z.prettifyError(parsedQuery.error), 400);
  }

  const {
    AssetFixDescription,
    AssetFixDocumentationURL,
    AssetFixed,
    AssetFixTitle,
    AssetIssueID,
    EmployeeID,
    FromAssetFixCost,
    FromAssetFixDateDays,
    FromAssetFixDateEnd,
    FromAssetFixDateStart,
    NewestRowsFirst,
    RowsToReturn,
    RowsToSkip,
    ToAssetFixCost,
    ToAssetFixDateDays,
    ToAssetFixDateEnd,
    ToAssetFixDateStart,
  } = parsedQuery.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("AssetIssueID", sql.UniqueIdentifier, AssetIssueID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input("AssetFixTitle", sql.NVarChar(4000), AssetFixTitle)
    .input("AssetFixDescription", sql.NVarChar(sql.MAX), AssetFixDescription)
    .input(
      "AssetFixDocumentationURL",
      sql.NVarChar(4000),
      AssetFixDocumentationURL,
    )
    .input("AssetFixed", sql.Bit, AssetFixed)
    .input(
      "FromAssetFixDateStart",
      sql.DateTimeOffset(3),
      FromAssetFixDateStart,
    )
    .input("ToAssetFixDateStart", sql.DateTimeOffset(3), ToAssetFixDateStart)
    .input("FromAssetFixDateEnd", sql.DateTimeOffset(3), FromAssetFixDateEnd)
    .input("ToAssetFixDateEnd", sql.DateTimeOffset(3), ToAssetFixDateEnd)
    .input("FromAssetFixCost", sql.Decimal(15, 4), FromAssetFixCost)
    .input("ToAssetFixCost", sql.Decimal(15, 4), ToAssetFixCost)
    .input("FromAssetFixDateDays", sql.BigInt, FromAssetFixDateDays)
    .input("ToAssetFixDateDays", sql.BigInt, ToAssetFixDateDays)
    .input("RowsToSkip", sql.Int, RowsToSkip)
    .input("RowsToReturn", sql.Int, RowsToReturn)
    .input("NewestRowsFirst", sql.Bit, NewestRowsFirst)
    .execute<AssetFix>(USP_READ_ASSETFIX)
    .then(({ recordset }) => {
      const parsedRecordset = AssetFixSchema.array().safeParse(recordset);

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
        USP_READ_ASSETFIX,
        JSON.stringify(
          { CallingEndUserID, ...parsedQuery.data },
          bigIntReplacer,
        ),
      );
    });
};

export const updateAssetFix = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = AssetFixSchema.pick({
    AssetFixID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { AssetFixID } = parsedParams.data;

  const parsedBody = AssetFixSchema.omit({
    AssetFixDateDays: true,
    AssetFixID: true,
  })
    .extend({
      AssetFixCost: zodXOR([
        AssetFixSchema.shape.AssetFixCost,
        NullishConstantsSchema.shape.NULLISH_DECIMAL,
      ]).prefault(NULLISH_DECIMAL),
      AssetFixDateEnd: zodXOR([
        zodParseDate(AssetFixSchema.shape.AssetFixDateEnd.unwrap()),
        NULLISH_DATETIMEOFFSET_SCHEMA,
      ])
        .nullable()
        .prefault(NULLISH_DATETIMEOFFSET),
      AssetFixDateStart: zodParseDate(AssetFixSchema.shape.AssetFixDateStart)
        .nullable()
        .prefault(null),
      AssetFixDescription: zodXOR([
        AssetFixSchema.shape.AssetFixDescription,
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      AssetFixDocumentationURL: zodXOR([
        AssetFixSchema.shape.AssetFixDocumentationURL,
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      AssetFixed: AssetFixSchema.shape.AssetFixed.nullable().prefault(null),
      AssetFixTitle:
        AssetFixSchema.shape.AssetFixTitle.nullable().prefault(null),
      AssetIssueID: AssetFixSchema.shape.AssetIssueID.nullable().prefault(null),
      EmployeeID: AssetFixSchema.shape.EmployeeID.nullable().prefault(null),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const {
    AssetFixCost,
    AssetFixDateEnd,
    AssetFixDateStart,
    AssetFixDescription,
    AssetFixDocumentationURL,
    AssetFixed,
    AssetFixTitle,
    AssetIssueID,
    EmployeeID,
  } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("AssetFixID", sql.UniqueIdentifier, AssetFixID)
    .input("AssetIssueID", sql.UniqueIdentifier, AssetIssueID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input("AssetFixDateStart", sql.DateTimeOffset(3), AssetFixDateStart)
    .input("AssetFixDateEnd", sql.DateTimeOffset(3), AssetFixDateEnd)
    .input("AssetFixTitle", sql.NVarChar(4000), AssetFixTitle)
    .input("AssetFixDescription", sql.NVarChar(sql.MAX), AssetFixDescription)
    .input(
      "AssetFixDocumentationURL",
      sql.NVarChar(4000),
      AssetFixDocumentationURL,
    )
    .input("AssetFixed", sql.Bit, AssetFixed)
    .input("AssetFixCost", sql.Decimal(15, 4), AssetFixCost)
    .execute<AssetFix>(USP_UPDATE_ASSETFIX)
    .then(({ recordset }) => {
      const parsedRecordset = AssetFixSchema.safeExtend({
        OldAssetFixCost: AssetFixSchema.shape.AssetFixCost,
        OldAssetFixDateDays: AssetFixSchema.shape.AssetFixDateDays,
        OldAssetFixDateEnd: AssetFixSchema.shape.AssetFixDateEnd,
        OldAssetFixDateStart: AssetFixSchema.shape.AssetFixDateStart,
        OldAssetFixDescription: AssetFixSchema.shape.AssetFixDescription,
        OldAssetFixDocumentationURL:
          AssetFixSchema.shape.AssetFixDocumentationURL,
        OldAssetFixed: AssetFixSchema.shape.AssetFixed,
        OldAssetFixTitle: AssetFixSchema.shape.AssetFixTitle,
        OldAssetIssueID: AssetFixSchema.shape.AssetIssueID,
        OldEmployeeID: AssetFixSchema.shape.EmployeeID,
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
        USP_UPDATE_ASSETFIX,
        JSON.stringify({
          CallingEndUserID,
          ...parsedParams.data,
          ...parsedBody.data,
        }),
      );
    });
};

export const deleteAssetFix = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = AssetFixSchema.pick({
    AssetFixID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { AssetFixID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("AssetFixID", sql.UniqueIdentifier, AssetFixID)
    .execute<AssetFix>(USP_DELETE_ASSETFIX)
    .then(({ recordset }) => {
      const parsedRecordset = AssetFixSchema.array()
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
        USP_DELETE_ASSETFIX,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};
