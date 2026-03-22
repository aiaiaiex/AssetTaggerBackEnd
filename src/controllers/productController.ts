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
  USP_CREATE_PRODUCT,
  USP_DELETE_PRODUCT,
  USP_READ_PRODUCT,
  USP_UPDATE_PRODUCT,
} from "../constants/StoredProcedureConstants";
import {
  TSQL_BIT_SCHEMA,
  TSQL_INT_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { ExpressError } from "../middlewares/handleError";
import { Log } from "../models/Log";
import { Product, ProductSchema } from "../models/Product";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import {
  zodParseDate,
  zodParseNumber,
  zodQuery,
  zodXOR,
} from "../utils/zodUtils";
import { usp_CreateLog } from "./logController";

export const createProduct = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedBody = ProductSchema.omit({
    ProductID: true,
    ProductInsertDate: true,
  })
    .extend({
      ManufacturerID:
        ProductSchema.shape.ManufacturerID.optional().prefault(null),
      ProductDocumentationURL:
        ProductSchema.shape.ProductDocumentationURL.optional().prefault(null),
      ProductModelNumber:
        ProductSchema.shape.ProductModelNumber.optional().prefault(null),
      ProductName: ProductSchema.shape.ProductName.optional().prefault(null),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const {
    CategoryID,
    ManufacturerID,
    ProductDocumentationURL,
    ProductModelNumber,
    ProductName,
  } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("ProductName", sql.NVarChar(421), ProductName)
    .input("ProductModelNumber", sql.NVarChar(421), ProductModelNumber)
    .input(
      "ProductDocumentationURL",
      sql.NVarChar(4000),
      ProductDocumentationURL,
    )
    .input("ManufacturerID", sql.UniqueIdentifier, ManufacturerID)
    .input("CategoryID", sql.UniqueIdentifier, CategoryID)
    .execute<Product>(USP_CREATE_PRODUCT)
    .then(({ recordset }) => {
      const parsedRecordset = ProductSchema.array()
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
        USP_CREATE_PRODUCT,
        JSON.stringify({ CallingEndUserID, ...parsedBody.data }),
      );
    });
};

export const readProduct = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = ProductSchema.pick({
    ProductID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { ProductID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("ProductID", sql.UniqueIdentifier, ProductID)
    .execute<Product>(USP_READ_PRODUCT)
    .then(({ recordset }) => {
      const parsedRecordset = ProductSchema.array().max(1).safeParse(recordset);

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
        USP_READ_PRODUCT,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};

export const readProducts = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedQuery = ProductSchema.omit({
    ProductID: true,
    ProductInsertDate: true,
  })
    .extend({
      CategoryID: zodQuery([ProductSchema.shape.CategoryID]).prefault(null),
      ManufacturerID: zodQuery([
        ProductSchema.shape.ManufacturerID.unwrap(),
        NullishConstantsSchema.shape.NULLISH_UNIQUEIDENTIFIER,
        NonNullishConstantsSchema.shape.NON_NULLISH_UNIQUEIDENTIFIER,
      ]).prefault(NULLISH_UNIQUEIDENTIFIER),
      ProductDocumentationURL: zodQuery([
        ProductSchema.shape.ProductDocumentationURL.unwrap(),
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
        NonNullishConstantsSchema.shape.NON_NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      ProductModelNumber: zodQuery([
        ProductSchema.shape.ProductModelNumber.unwrap(),
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
        NonNullishConstantsSchema.shape.NON_NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      ProductName: zodQuery([
        ProductSchema.shape.ProductName.unwrap(),
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
        NonNullishConstantsSchema.shape.NON_NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
    })
    .safeExtend({
      FromProductInsertDate: zodQuery([
        zodParseDate(ProductSchema.shape.ProductInsertDate),
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
      ToProductInsertDate: zodQuery([
        zodParseDate(ProductSchema.shape.ProductInsertDate),
      ]).prefault(null),
    })
    .safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ExpressError(z.prettifyError(parsedQuery.error), 400);
  }

  const {
    CategoryID,
    FromProductInsertDate,
    ManufacturerID,
    NewestRowsFirst,
    ProductDocumentationURL,
    ProductModelNumber,
    ProductName,
    RowsToReturn,
    RowsToSkip,
    ToProductInsertDate,
  } = parsedQuery.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("ProductName", sql.NVarChar(421), ProductName)
    .input("ProductModelNumber", sql.NVarChar(421), ProductModelNumber)
    .input(
      "ProductDocumentationURL",
      sql.NVarChar(4000),
      ProductDocumentationURL,
    )
    .input("ManufacturerID", sql.UniqueIdentifier, ManufacturerID)
    .input("CategoryID", sql.UniqueIdentifier, CategoryID)
    .input(
      "FromProductInsertDate",
      sql.DateTimeOffset(3),
      FromProductInsertDate,
    )
    .input("ToProductInsertDate", sql.DateTimeOffset(3), ToProductInsertDate)
    .input("RowsToSkip", sql.Int, RowsToSkip)
    .input("RowsToReturn", sql.Int, RowsToReturn)
    .input("NewestRowsFirst", sql.Bit, NewestRowsFirst)
    .execute<Product>(USP_READ_PRODUCT)
    .then(({ recordset }) => {
      const parsedRecordset = ProductSchema.array().safeParse(recordset);

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
        USP_READ_PRODUCT,
        JSON.stringify({ CallingEndUserID, ...parsedQuery.data }),
      );
    });
};

export const updateProduct = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = ProductSchema.pick({
    ProductID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { ProductID } = parsedParams.data;

  const parsedBody = ProductSchema.omit({
    ProductID: true,
    ProductInsertDate: true,
  })
    .extend({
      CategoryID: ProductSchema.shape.CategoryID.nullable().prefault(null),
      ManufacturerID: zodXOR([
        ProductSchema.shape.ManufacturerID,
        NullishConstantsSchema.shape.NULLISH_UNIQUEIDENTIFIER,
      ]).prefault(NULLISH_UNIQUEIDENTIFIER),
      ProductDocumentationURL: zodXOR([
        ProductSchema.shape.ProductDocumentationURL,
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      ProductModelNumber: zodXOR([
        ProductSchema.shape.ProductModelNumber,
        NullishConstantsSchema.shape.NULLISH_NVARCHAR,
      ]).prefault(NULLISH_NVARCHAR),
      ProductName: ProductSchema.shape.ProductName.nullable().prefault(null),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const {
    CategoryID,
    ManufacturerID,
    ProductDocumentationURL,
    ProductModelNumber,
    ProductName,
  } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("ProductID", sql.UniqueIdentifier, ProductID)
    .input("ProductName", sql.NVarChar(421), ProductName)
    .input("ProductModelNumber", sql.NVarChar(421), ProductModelNumber)
    .input(
      "ProductDocumentationURL",
      sql.NVarChar(4000),
      ProductDocumentationURL,
    )
    .input("ManufacturerID", sql.UniqueIdentifier, ManufacturerID)
    .input("CategoryID", sql.UniqueIdentifier, CategoryID)
    .execute<Product>(USP_UPDATE_PRODUCT)
    .then(({ recordset }) => {
      const parsedRecordset = ProductSchema.safeExtend({
        OldCategoryID: ProductSchema.shape.CategoryID,
        OldManufacturerID: ProductSchema.shape.ManufacturerID,
        OldProductDocumentationURL: ProductSchema.shape.ProductDocumentationURL,
        OldProductModelNumber: ProductSchema.shape.ProductModelNumber,
        OldProductName: ProductSchema.shape.ProductName,
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
        USP_UPDATE_PRODUCT,
        JSON.stringify({
          CallingEndUserID,
          ...parsedParams.data,
          ...parsedBody.data,
        }),
      );
    });
};

export const deleteProduct = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = ProductSchema.pick({
    ProductID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { ProductID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("ProductID", sql.UniqueIdentifier, ProductID)
    .execute<Product>(USP_DELETE_PRODUCT)
    .then(({ recordset }) => {
      const parsedRecordset = ProductSchema.array().max(1).safeParse(recordset);

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
        USP_DELETE_PRODUCT,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};
