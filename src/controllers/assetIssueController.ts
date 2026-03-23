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
  USP_CREATE_ASSETISSUE,
  USP_DELETE_ASSETISSUE,
  USP_READ_ASSETISSUE,
  USP_UPDATE_ASSETISSUE,
} from "../constants/StoredProcedureConstants";
import {
  TSQL_BIT_SCHEMA,
  TSQL_INT_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { ExpressError } from "../middlewares/handleError";
import { AssetIssue, AssetIssueSchema } from "../models/AssetIssue";
import { Log } from "../models/Log";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import {
  zodParseDate,
  zodParseNumber,
  zodQuery,
  zodXOR,
} from "../utils/zodUtils";
import { usp_CreateLog } from "./logController";

export const createAssetIssue = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedBody = AssetIssueSchema.omit({
    AssetIssueID: true,
  })
    .extend({
      AssetIssueDate:
        AssetIssueSchema.shape.AssetIssueDate.nullish().prefault(null),
      AssetIssueDescription:
        AssetIssueSchema.shape.AssetIssueDescription.prefault(null),
      AssetIssueDocumentationURL:
        AssetIssueSchema.shape.AssetIssueDocumentationURL.prefault(null),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const {
    AssetID,
    AssetIssueDate,
    AssetIssueDescription,
    AssetIssueDocumentationURL,
    AssetIssueTitle,
    EmployeeID,
  } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("AssetID", sql.UniqueIdentifier, AssetID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input("AssetIssueDate", sql.DateTimeOffset(3), AssetIssueDate)
    .input("AssetIssueTitle", sql.NVarChar(4000), AssetIssueTitle)
    .input(
      "AssetIssueDescription",
      sql.NVarChar(sql.MAX),
      AssetIssueDescription,
    )
    .input(
      "AssetIssueDocumentationURL",
      sql.NVarChar(4000),
      AssetIssueDocumentationURL,
    )
    .execute<AssetIssue>(USP_CREATE_ASSETISSUE)
    .then(({ recordset }) => {
      const parsedRecordset = AssetIssueSchema.array()
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
        USP_CREATE_ASSETISSUE,
        JSON.stringify({ CallingEndUserID, ...parsedBody.data }),
      );
    });
};

export const readAssetIssue = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = AssetIssueSchema.pick({
    AssetIssueID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { AssetIssueID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("AssetIssueID", sql.UniqueIdentifier, AssetIssueID)
    .execute<AssetIssue>(USP_READ_ASSETISSUE)
    .then(({ recordset }) => {
      const parsedRecordset = AssetIssueSchema.array()
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
        USP_READ_ASSETISSUE,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};

export const readAssetIssues = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedQuery = AssetIssueSchema.omit({
    AssetIssueDate: true,
    AssetIssueID: true,
  })
    .extend({
      AssetID: zodQuery([AssetIssueSchema.shape.AssetID]).prefault(null),
      AssetIssueDescription: zodQuery([
        AssetIssueSchema.shape.AssetIssueDescription,
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
        NonNullishConstantsSchema.shape.NON_NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      AssetIssueDocumentationURL: zodQuery([
        AssetIssueSchema.shape.AssetIssueDocumentationURL,
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
        NonNullishConstantsSchema.shape.NON_NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      AssetIssueTitle: zodQuery([
        AssetIssueSchema.shape.AssetIssueTitle,
      ]).prefault(null),
      EmployeeID: zodQuery([AssetIssueSchema.shape.EmployeeID]).prefault(null),
    })
    .safeExtend({
      FromAssetIssueDate: zodQuery([
        zodParseDate(AssetIssueSchema.shape.AssetIssueDate),
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
      ToAssetIssueDate: zodQuery([
        zodParseDate(AssetIssueSchema.shape.AssetIssueDate),
      ]).prefault(null),
    })
    .safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ExpressError(z.prettifyError(parsedQuery.error), 400);
  }

  const {
    AssetID,
    AssetIssueDescription,
    AssetIssueDocumentationURL,
    AssetIssueTitle,
    EmployeeID,
    FromAssetIssueDate,
    NewestRowsFirst,
    RowsToReturn,
    RowsToSkip,
    ToAssetIssueDate,
  } = parsedQuery.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("AssetID", sql.UniqueIdentifier, AssetID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input("AssetIssueTitle", sql.NVarChar(4000), AssetIssueTitle)
    .input(
      "AssetIssueDescription",
      sql.NVarChar(sql.MAX),
      AssetIssueDescription,
    )
    .input(
      "AssetIssueDocumentationURL",
      sql.NVarChar(4000),
      AssetIssueDocumentationURL,
    )
    .input("FromAssetIssueDate", sql.DateTimeOffset(3), FromAssetIssueDate)
    .input("ToAssetIssueDate", sql.DateTimeOffset(3), ToAssetIssueDate)
    .input("RowsToSkip", sql.Int, RowsToSkip)
    .input("RowsToReturn", sql.Int, RowsToReturn)
    .input("NewestRowsFirst", sql.Bit, NewestRowsFirst)
    .execute<AssetIssue>(USP_READ_ASSETISSUE)
    .then(({ recordset }) => {
      const parsedRecordset = AssetIssueSchema.array().safeParse(recordset);

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
        USP_READ_ASSETISSUE,
        JSON.stringify({ CallingEndUserID, ...parsedQuery.data }),
      );
    });
};

export const updateAssetIssue = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = AssetIssueSchema.pick({
    AssetIssueID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { AssetIssueID } = parsedParams.data;

  const parsedBody = AssetIssueSchema.omit({
    AssetIssueID: true,
  })
    .extend({
      AssetID: AssetIssueSchema.shape.AssetID.nullable().prefault(null),
      AssetIssueDate:
        AssetIssueSchema.shape.AssetIssueDate.nullable().prefault(null),
      AssetIssueDescription: zodXOR([
        AssetIssueSchema.shape.AssetIssueDescription,
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      AssetIssueDocumentationURL: zodXOR([
        AssetIssueSchema.shape.AssetIssueDocumentationURL,
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      AssetIssueTitle:
        AssetIssueSchema.shape.AssetIssueTitle.nullable().prefault(null),
      EmployeeID: AssetIssueSchema.shape.EmployeeID.nullable().prefault(null),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const {
    AssetID,
    AssetIssueDate,
    AssetIssueDescription,
    AssetIssueDocumentationURL,
    AssetIssueTitle,
    EmployeeID,
  } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("AssetIssueID", sql.UniqueIdentifier, AssetIssueID)
    .input("AssetID", sql.UniqueIdentifier, AssetID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input("AssetIssueDate", sql.DateTimeOffset(3), AssetIssueDate)
    .input("AssetIssueTitle", sql.NVarChar(4000), AssetIssueTitle)
    .input(
      "AssetIssueDescription",
      sql.NVarChar(sql.MAX),
      AssetIssueDescription,
    )
    .input(
      "AssetIssueDocumentationURL",
      sql.NVarChar(4000),
      AssetIssueDocumentationURL,
    )
    .execute<AssetIssue>(USP_UPDATE_ASSETISSUE)
    .then(({ recordset }) => {
      const parsedRecordset = AssetIssueSchema.safeExtend({
        OldAssetID: AssetIssueSchema.shape.AssetID,
        OldAssetIssueDate: AssetIssueSchema.shape.AssetIssueDate,
        OldAssetIssueDescription: AssetIssueSchema.shape.AssetIssueDescription,
        OldAssetIssueDocumentationURL:
          AssetIssueSchema.shape.AssetIssueDocumentationURL,
        OldAssetIssueTitle: AssetIssueSchema.shape.AssetIssueTitle,
        OldEmployeeID: AssetIssueSchema.shape.EmployeeID,
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
        USP_UPDATE_ASSETISSUE,
        JSON.stringify({
          CallingEndUserID,
          ...parsedParams.data,
          ...parsedBody.data,
        }),
      );
    });
};

export const deleteAssetIssue = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = AssetIssueSchema.pick({
    AssetIssueID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { AssetIssueID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("AssetIssueID", sql.UniqueIdentifier, AssetIssueID)
    .execute<AssetIssue>(USP_DELETE_ASSETISSUE)
    .then(({ recordset }) => {
      const parsedRecordset = AssetIssueSchema.array()
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
        USP_DELETE_ASSETISSUE,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};
