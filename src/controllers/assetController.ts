import { Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import sql from "mssql";
import z from "zod";

import {
  NON_NULLISH_DATETIMEOFFSET_SCHEMA,
  NonNullishConstantsSchema,
} from "../constants/NonNullishConstants";
import {
  NULLISH_DATETIMEOFFSET,
  NULLISH_DATETIMEOFFSET_SCHEMA,
  NULLISH_DECIMAL,
  NULLISH_INT,
  NULLISH_NCHAR,
  NULLISH_NVARCHAR,
  NULLISH_UNIQUEIDENTIFIER,
  NullishConstantsSchema,
} from "../constants/NullishConstants";
import {
  USP_CREATE_ASSET,
  USP_DELETE_ASSET,
  USP_READ_ASSET,
  USP_UPDATE_ASSET,
} from "../constants/StoredProcedureConstants";
import {
  TSQL_BIT_SCHEMA,
  TSQL_INT_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { ExpressError } from "../middlewares/handleError";
import { Asset, AssetSchema } from "../models/Asset";
import { Log } from "../models/Log";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import {
  zodParseDate,
  zodParseNumber,
  zodQuery,
  zodXOR,
} from "../utils/zodUtils";
import { usp_CreateLog } from "./logController";

export const createAsset = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedBody = AssetSchema.omit({
    AssetAnnualDepreciationExpense: true,
    AssetCurrentBookValue: true,
    AssetID: true,
    AssetTagDate: true,
    AssetWarrantyExpirationDate: true,
  })
    .extend({
      AssetDocumentationURL:
        AssetSchema.shape.AssetDocumentationURL.prefault(null),
      AssetPurchaseDate: AssetSchema.shape.AssetPurchaseDate.prefault(null),
      AssetPurchasePrice: AssetSchema.shape.AssetPurchasePrice.prefault(null),
      AssetSalvageValue: AssetSchema.shape.AssetSalvageValue.prefault(null),
      AssetSerialNumber: AssetSchema.shape.AssetSerialNumber.prefault(null),
      AssetUsefulLife: AssetSchema.shape.AssetUsefulLife.prefault(null),
      AssetWarrantyDuration:
        AssetSchema.shape.AssetWarrantyDuration.prefault(null),
      AssetWarrantyUnitOfMeasure:
        AssetSchema.shape.AssetWarrantyUnitOfMeasure.prefault(null),
      VendorID: AssetSchema.shape.VendorID.prefault(null),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const {
    AssetDocumentationURL,
    AssetPurchaseDate,
    AssetPurchasePrice,
    AssetSalvageValue,
    AssetSerialNumber,
    AssetUsefulLife,
    AssetWarrantyDuration,
    AssetWarrantyUnitOfMeasure,
    EmployeeID,
    LocationID,
    ProductID,
    VendorID,
  } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("ProductID", sql.UniqueIdentifier, ProductID)
    .input("LocationID", sql.UniqueIdentifier, LocationID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input("VendorID", sql.UniqueIdentifier, VendorID)
    .input("AssetPurchaseDate", sql.DateTimeOffset(3), AssetPurchaseDate)
    .input("AssetPurchasePrice", sql.Decimal(15, 4), AssetPurchasePrice)
    .input("AssetSerialNumber", sql.NVarChar(842), AssetSerialNumber)
    .input("AssetDocumentationURL", sql.NVarChar(4000), AssetDocumentationURL)
    .input(
      "AssetWarrantyUnitOfMeasure",
      sql.NChar(2),
      AssetWarrantyUnitOfMeasure,
    )
    .input("AssetWarrantyDuration", sql.Int, AssetWarrantyDuration)
    .input("AssetUsefulLife", sql.Int, AssetUsefulLife)
    .input("AssetSalvageValue", sql.Decimal(15, 4), AssetSalvageValue)
    .execute<Asset>(USP_CREATE_ASSET)
    .then(({ recordset }) => {
      const parsedRecordset = AssetSchema.array()
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
        USP_CREATE_ASSET,
        JSON.stringify({ CallingEndUserID, ...parsedBody.data }),
      );
    });
};

export const readAsset = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = AssetSchema.pick({
    AssetID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { AssetID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("AssetID", sql.UniqueIdentifier, AssetID)
    .execute<Asset>(USP_READ_ASSET)
    .then(({ recordset }) => {
      const parsedRecordset = AssetSchema.array().max(1).safeParse(recordset);

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
        USP_READ_ASSET,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};

export const readAssets = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedQuery = AssetSchema.omit({
    AssetAnnualDepreciationExpense: true,
    AssetCurrentBookValue: true,
    AssetID: true,
    AssetPurchaseDate: true,
    AssetPurchasePrice: true,
    AssetSalvageValue: true,
    AssetTagDate: true,
    AssetUsefulLife: true,
    AssetWarrantyDuration: true,
    AssetWarrantyExpirationDate: true,
  })
    .extend({
      AssetDocumentationURL: zodQuery([
        AssetSchema.shape.AssetDocumentationURL.unwrap(),
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
        NonNullishConstantsSchema.shape.NON_NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      AssetSerialNumber: zodQuery([
        AssetSchema.shape.AssetSerialNumber.unwrap(),
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
        NonNullishConstantsSchema.shape.NON_NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      AssetWarrantyUnitOfMeasure: zodQuery([
        AssetSchema.shape.AssetWarrantyUnitOfMeasure.unwrap(),
        NullishConstantsSchema.shape.NULLISH_NCHAR,
        NonNullishConstantsSchema.shape.NON_NULLISH_NCHAR,
      ]).prefault(NULLISH_NCHAR),
      EmployeeID: zodQuery([AssetSchema.shape.EmployeeID]).prefault(null),
      LocationID: zodQuery([AssetSchema.shape.LocationID]).prefault(null),
      ProductID: zodQuery([AssetSchema.shape.ProductID]).prefault(null),
      VendorID: zodQuery([
        AssetSchema.shape.VendorID.unwrap(),
        NullishConstantsSchema.shape.NULLISH_UNIQUEIDENTIFIER,
        NonNullishConstantsSchema.shape.NON_NULLISH_UNIQUEIDENTIFIER,
      ]).prefault(NULLISH_UNIQUEIDENTIFIER),
    })
    .safeExtend({
      FromAssetAnnualDepreciationExpense: zodQuery([
        AssetSchema.shape.AssetAnnualDepreciationExpense.unwrap(),
        NullishConstantsSchema.shape.NULLISH_DECIMAL,
        NonNullishConstantsSchema.shape.NON_NULLISH_DECIMAL,
      ]).prefault(NULLISH_DECIMAL),
      FromAssetCurrentBookValue: zodQuery([
        AssetSchema.shape.AssetCurrentBookValue.unwrap(),
        NullishConstantsSchema.shape.NULLISH_DECIMAL,
        NonNullishConstantsSchema.shape.NON_NULLISH_DECIMAL,
      ]).prefault(NULLISH_DECIMAL),
      FromAssetPurchaseDate: zodQuery([
        AssetSchema.shape.AssetPurchaseDate.unwrap(),
        NULLISH_DATETIMEOFFSET_SCHEMA,
        NON_NULLISH_DATETIMEOFFSET_SCHEMA,
      ]).prefault(NULLISH_DATETIMEOFFSET),
      FromAssetPurchasePrice: zodQuery([
        AssetSchema.shape.AssetPurchasePrice.unwrap(),
        NullishConstantsSchema.shape.NULLISH_DECIMAL,
        NonNullishConstantsSchema.shape.NON_NULLISH_DECIMAL,
      ]).prefault(NULLISH_DECIMAL),
      FromAssetSalvageValue: zodQuery([
        AssetSchema.shape.AssetSalvageValue.unwrap(),
        NullishConstantsSchema.shape.NULLISH_DECIMAL,
        NonNullishConstantsSchema.shape.NON_NULLISH_DECIMAL,
      ]).prefault(NULLISH_DECIMAL),
      FromAssetTagDate: zodQuery([
        zodParseDate(AssetSchema.shape.AssetTagDate),
      ]).prefault(null),
      FromAssetUsefulLife: zodQuery([
        AssetSchema.shape.AssetUsefulLife.unwrap(),
        NullishConstantsSchema.shape.NULLISH_INT,
        NonNullishConstantsSchema.shape.NON_NULLISH_INT,
      ]).prefault(NULLISH_INT),
      FromAssetWarrantyDuration: zodQuery([
        AssetSchema.shape.AssetWarrantyDuration.unwrap(),
        NullishConstantsSchema.shape.NULLISH_INT,
        NonNullishConstantsSchema.shape.NON_NULLISH_INT,
      ]).prefault(NULLISH_INT),
      FromAssetWarrantyExpirationDate: zodQuery([
        AssetSchema.shape.AssetWarrantyExpirationDate.unwrap(),
        NULLISH_DATETIMEOFFSET_SCHEMA,
        NON_NULLISH_DATETIMEOFFSET_SCHEMA,
      ]).prefault(NULLISH_DATETIMEOFFSET),
      NewestRowsFirst: zodQuery([zodParseNumber(TSQL_BIT_SCHEMA)]).prefault(
        null,
      ),
      RowsToReturn: zodQuery([zodParseNumber(TSQL_INT_SCHEMA.min(1))]).prefault(
        null,
      ),
      RowsToSkip: zodQuery([zodParseNumber(TSQL_INT_SCHEMA.min(0))]).prefault(
        null,
      ),
      ToAssetAnnualDepreciationExpense: zodQuery([
        AssetSchema.shape.AssetAnnualDepreciationExpense.unwrap(),
        NullishConstantsSchema.shape.NULLISH_DECIMAL,
        NonNullishConstantsSchema.shape.NON_NULLISH_DECIMAL,
      ]).prefault(NULLISH_DECIMAL),
      ToAssetCurrentBookValue: zodQuery([
        AssetSchema.shape.AssetCurrentBookValue.unwrap(),
        NullishConstantsSchema.shape.NULLISH_DECIMAL,
        NonNullishConstantsSchema.shape.NON_NULLISH_DECIMAL,
      ]).prefault(NULLISH_DECIMAL),
      ToAssetPurchaseDate: zodQuery([
        AssetSchema.shape.AssetPurchaseDate.unwrap(),
        NULLISH_DATETIMEOFFSET_SCHEMA,
        NON_NULLISH_DATETIMEOFFSET_SCHEMA,
      ]).prefault(NULLISH_DATETIMEOFFSET),
      ToAssetPurchasePrice: zodQuery([
        AssetSchema.shape.AssetPurchasePrice.unwrap(),
        NullishConstantsSchema.shape.NULLISH_DECIMAL,
        NonNullishConstantsSchema.shape.NON_NULLISH_DECIMAL,
      ]).prefault(NULLISH_DECIMAL),
      ToAssetSalvageValue: zodQuery([
        AssetSchema.shape.AssetSalvageValue.unwrap(),
        NullishConstantsSchema.shape.NULLISH_DECIMAL,
        NonNullishConstantsSchema.shape.NON_NULLISH_DECIMAL,
      ]).prefault(NULLISH_DECIMAL),
      ToAssetTagDate: zodQuery([
        zodParseDate(AssetSchema.shape.AssetTagDate),
      ]).prefault(null),
      ToAssetUsefulLife: zodQuery([
        AssetSchema.shape.AssetUsefulLife.unwrap(),
        NullishConstantsSchema.shape.NULLISH_INT,
        NonNullishConstantsSchema.shape.NON_NULLISH_INT,
      ]).prefault(NULLISH_INT),
      ToAssetWarrantyDuration: zodQuery([
        AssetSchema.shape.AssetWarrantyDuration.unwrap(),
        NullishConstantsSchema.shape.NULLISH_INT,
        NonNullishConstantsSchema.shape.NON_NULLISH_INT,
      ]).prefault(NULLISH_INT),
      ToAssetWarrantyExpirationDate: zodQuery([
        AssetSchema.shape.AssetWarrantyExpirationDate.unwrap(),
        NULLISH_DATETIMEOFFSET_SCHEMA,
        NON_NULLISH_DATETIMEOFFSET_SCHEMA,
      ]).prefault(NULLISH_DATETIMEOFFSET),
    })
    .safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ExpressError(z.prettifyError(parsedQuery.error), 400);
  }

  const {
    AssetDocumentationURL,
    AssetSerialNumber,
    AssetWarrantyUnitOfMeasure,
    EmployeeID,
    FromAssetAnnualDepreciationExpense,
    FromAssetCurrentBookValue,
    FromAssetPurchaseDate,
    FromAssetPurchasePrice,
    FromAssetSalvageValue,
    FromAssetTagDate,
    FromAssetUsefulLife,
    FromAssetWarrantyDuration,
    FromAssetWarrantyExpirationDate,
    LocationID,
    NewestRowsFirst,
    ProductID,
    RowsToReturn,
    RowsToSkip,
    ToAssetAnnualDepreciationExpense,
    ToAssetCurrentBookValue,
    ToAssetPurchaseDate,
    ToAssetPurchasePrice,
    ToAssetSalvageValue,
    ToAssetTagDate,
    ToAssetUsefulLife,
    ToAssetWarrantyDuration,
    ToAssetWarrantyExpirationDate,
    VendorID,
  } = parsedQuery.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("ProductID", sql.UniqueIdentifier, ProductID)
    .input("LocationID", sql.UniqueIdentifier, LocationID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input("VendorID", sql.UniqueIdentifier, VendorID)
    .input("AssetSerialNumber", sql.NVarChar(842), AssetSerialNumber)
    .input("AssetDocumentationURL", sql.NVarChar(4000), AssetDocumentationURL)
    .input(
      "AssetWarrantyUnitOfMeasure",
      sql.NChar(2),
      AssetWarrantyUnitOfMeasure,
    )
    .input("FromAssetWarrantyDuration", sql.Int, FromAssetWarrantyDuration)
    .input("ToAssetWarrantyDuration", sql.Int, ToAssetWarrantyDuration)
    .input("FromAssetUsefulLife", sql.Int, FromAssetUsefulLife)
    .input("ToAssetUsefulLife", sql.Int, ToAssetUsefulLife)
    .input("FromAssetPurchasePrice", sql.Decimal(15, 4), FromAssetPurchasePrice)
    .input("ToAssetPurchasePrice", sql.Decimal(15, 4), ToAssetPurchasePrice)
    .input("FromAssetSalvageValue", sql.Decimal(15, 4), FromAssetSalvageValue)
    .input("ToAssetSalvageValue", sql.Decimal(15, 4), ToAssetSalvageValue)
    .input(
      "FromAssetAnnualDepreciationExpense",
      sql.Decimal(15, 4),
      FromAssetAnnualDepreciationExpense,
    )
    .input(
      "ToAssetAnnualDepreciationExpense",
      sql.Decimal(15, 4),
      ToAssetAnnualDepreciationExpense,
    )
    .input(
      "FromAssetCurrentBookValue",
      sql.Decimal(15, 4),
      FromAssetCurrentBookValue,
    )
    .input(
      "ToAssetCurrentBookValue",
      sql.Decimal(15, 4),
      ToAssetCurrentBookValue,
    )
    .input(
      "FromAssetPurchaseDate",
      sql.DateTimeOffset(3),
      FromAssetPurchaseDate,
    )
    .input("ToAssetPurchaseDate", sql.DateTimeOffset(3), ToAssetPurchaseDate)
    .input(
      "FromAssetWarrantyExpirationDate",
      sql.DateTimeOffset(3),
      FromAssetWarrantyExpirationDate,
    )
    .input(
      "ToAssetWarrantyExpirationDate",
      sql.DateTimeOffset(3),
      ToAssetWarrantyExpirationDate,
    )
    .input("FromAssetTagDate", sql.DateTimeOffset(3), FromAssetTagDate)
    .input("ToAssetTagDate", sql.DateTimeOffset(3), ToAssetTagDate)
    .input("RowsToSkip", sql.Int, RowsToSkip)
    .input("RowsToReturn", sql.Int, RowsToReturn)
    .input("NewestRowsFirst", sql.Bit, NewestRowsFirst)
    .execute<Asset>(USP_READ_ASSET)
    .then(({ recordset }) => {
      const parsedRecordset = AssetSchema.array().safeParse(recordset);

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
        USP_READ_ASSET,
        JSON.stringify({ CallingEndUserID, ...parsedQuery.data }),
      );
    });
};

export const updateAsset = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = AssetSchema.pick({
    AssetID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { AssetID } = parsedParams.data;

  const parsedBody = AssetSchema.omit({
    AssetAnnualDepreciationExpense: true,
    AssetCurrentBookValue: true,
    AssetID: true,
    AssetTagDate: true,
    AssetWarrantyExpirationDate: true,
  })
    .extend({
      AssetDocumentationURL: zodXOR([
        AssetSchema.shape.AssetDocumentationURL,
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      AssetPurchaseDate: zodXOR([
        AssetSchema.shape.AssetPurchaseDate,
        NULLISH_DATETIMEOFFSET_SCHEMA,
      ]).prefault(NULLISH_DATETIMEOFFSET),
      AssetPurchasePrice: zodXOR([
        AssetSchema.shape.AssetPurchasePrice,
        NullishConstantsSchema.shape.NULLISH_DECIMAL,
      ]).prefault(NULLISH_DECIMAL),
      AssetSalvageValue: zodXOR([
        AssetSchema.shape.AssetSalvageValue,
        NullishConstantsSchema.shape.NULLISH_DECIMAL,
      ]).prefault(NULLISH_DECIMAL),
      AssetSerialNumber: zodXOR([
        AssetSchema.shape.AssetSerialNumber,
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      AssetWarrantyDuration: zodXOR([
        AssetSchema.shape.AssetWarrantyDuration,
        NullishConstantsSchema.shape.NULLISH_INT,
      ]).prefault(NULLISH_INT),
      AssetWarrantyUnitOfMeasure: zodXOR([
        AssetSchema.shape.AssetWarrantyUnitOfMeasure,
        NullishConstantsSchema.shape.NULLISH_NCHAR,
      ]).prefault(NULLISH_NCHAR),
      EmployeeID: AssetSchema.shape.EmployeeID.nullable().prefault(null),
      LocationID: AssetSchema.shape.LocationID.nullable().prefault(null),
      ProductID: AssetSchema.shape.ProductID.nullable().prefault(null),
      VendorID: zodXOR([
        AssetSchema.shape.VendorID,
        NullishConstantsSchema.shape.NULLISH_UNIQUEIDENTIFIER,
      ]).prefault(NULLISH_UNIQUEIDENTIFIER),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const {
    AssetDocumentationURL,
    AssetPurchaseDate,
    AssetPurchasePrice,
    AssetSalvageValue,
    AssetSerialNumber,
    AssetUsefulLife,
    AssetWarrantyDuration,
    AssetWarrantyUnitOfMeasure,
    EmployeeID,
    LocationID,
    ProductID,
    VendorID,
  } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("AssetID", sql.UniqueIdentifier, AssetID)
    .input("ProductID", sql.UniqueIdentifier, ProductID)
    .input("LocationID", sql.UniqueIdentifier, LocationID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input("VendorID", sql.UniqueIdentifier, VendorID)
    .input("AssetPurchaseDate", sql.DateTimeOffset(3), AssetPurchaseDate)
    .input("AssetPurchasePrice", sql.Decimal(15, 4), AssetPurchasePrice)
    .input("AssetSerialNumber", sql.NVarChar(842), AssetSerialNumber)
    .input("AssetDocumentationURL", sql.NVarChar(4000), AssetDocumentationURL)
    .input(
      "AssetWarrantyUnitOfMeasure",
      sql.NChar(2),
      AssetWarrantyUnitOfMeasure,
    )
    .input("AssetWarrantyDuration", sql.Int, AssetWarrantyDuration)
    .input("AssetUsefulLife", sql.Int, AssetUsefulLife)
    .input("AssetSalvageValue", sql.Decimal(15, 4), AssetSalvageValue)
    .execute<Asset>(USP_UPDATE_ASSET)
    .then(({ recordset }) => {
      const parsedRecordset = AssetSchema.safeExtend({
        OldAssetAnnualDepreciationExpense:
          AssetSchema.shape.AssetAnnualDepreciationExpense,
        OldAssetCurrentBookValue: AssetSchema.shape.AssetCurrentBookValue,
        OldAssetDocumentationURL: AssetSchema.shape.AssetDocumentationURL,
        OldAssetPurchaseDate: AssetSchema.shape.AssetPurchaseDate,
        OldAssetPurchasePrice: AssetSchema.shape.AssetPurchasePrice,
        OldAssetSalvageValue: AssetSchema.shape.AssetSalvageValue,
        OldAssetSerialNumber: AssetSchema.shape.AssetSerialNumber,
        OldAssetUsefulLife: AssetSchema.shape.AssetUsefulLife,
        OldAssetWarrantyDuration: AssetSchema.shape.AssetWarrantyDuration,
        OldAssetWarrantyExpirationDate:
          AssetSchema.shape.AssetWarrantyExpirationDate,
        OldAssetWarrantyUnitOfMeasure:
          AssetSchema.shape.AssetWarrantyUnitOfMeasure,
        OldEmployeeID: AssetSchema.shape.EmployeeID,
        OldLocationID: AssetSchema.shape.LocationID,
        OldProductID: AssetSchema.shape.ProductID,
        OldVendorID: AssetSchema.shape.VendorID,
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
        USP_UPDATE_ASSET,
        JSON.stringify({
          CallingEndUserID,
          ...parsedParams.data,
          ...parsedBody.data,
        }),
      );
    });
};

export const deleteAsset = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = AssetSchema.pick({
    AssetID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { AssetID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("AssetID", sql.UniqueIdentifier, AssetID)
    .execute<Asset>(USP_DELETE_ASSET)
    .then(({ recordset }) => {
      const parsedRecordset = AssetSchema.array().max(1).safeParse(recordset);

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
        USP_DELETE_ASSET,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};
