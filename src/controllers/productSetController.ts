import { Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import sql from "mssql";
import z from "zod";

import {
  USP_CREATE_PRODUCTSET,
  USP_DELETE_PRODUCTSET,
  USP_READ_PRODUCTSET,
  USP_UPDATE_PRODUCTSET,
} from "../constants/StoredProcedureConstants";
import {
  TSQL_BIT_SCHEMA,
  TSQL_INT_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { ExpressError } from "../middlewares/handleError";
import { Log } from "../models/Log";
import { ProductSet, ProductSetSchema } from "../models/ProductSet";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import { zodParseDate, zodParseNumber, zodQuery } from "../utils/zodUtils";
import { usp_CreateLog } from "./logController";

export const createProductSet = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedBody = ProductSetSchema.omit({
    ProductSetInsertDate: true,
  })
    .extend({
      ProductSetProductQuantity:
        ProductSetSchema.shape.ProductSetProductQuantity.prefault(1),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const { ParentProductID, ProductID, ProductSetProductQuantity } =
    parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("ParentProductID", sql.UniqueIdentifier, ParentProductID)
    .input("ProductID", sql.UniqueIdentifier, ProductID)
    .input("ProductSetProductQuantity", sql.Int, ProductSetProductQuantity)
    .execute<ProductSet>(USP_CREATE_PRODUCTSET)
    .then(({ recordset }) => {
      const parsedRecordset = ProductSetSchema.array()
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
        USP_CREATE_PRODUCTSET,
        JSON.stringify({ CallingEndUserID, ...parsedBody.data }),
      );
    });
};

export const readProductSet = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = ProductSetSchema.pick({
    ParentProductID: true,
    ProductID: true,
  })
    .extend({
      ProductID: zodQuery([ProductSetSchema.shape.ProductID])
        .optional()
        .prefault(null),
    })
    .safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { ParentProductID, ProductID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("ParentProductID", sql.UniqueIdentifier, ParentProductID)
    .input("ProductID", sql.UniqueIdentifier, ProductID)
    .execute<ProductSet>(USP_READ_PRODUCTSET)
    .then(({ recordset }) => {
      const parsedRecordset = ProductSetSchema.array().safeParse(recordset);

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
        USP_READ_PRODUCTSET,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};

export const readProductSets = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedQuery = ProductSetSchema.omit({
    ParentProductID: true,
    ProductSetInsertDate: true,
    ProductSetProductQuantity: true,
  })
    .extend({
      ProductID: zodQuery([ProductSetSchema.shape.ProductID]).prefault(null),
    })
    .safeExtend({
      FromProductSetInsertDate: zodQuery([
        zodParseDate(ProductSetSchema.shape.ProductSetInsertDate),
      ]).prefault(null),
      FromProductSetProductQuantity: zodQuery([
        zodParseNumber(ProductSetSchema.shape.ProductSetProductQuantity),
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
      ToProductSetInsertDate: zodQuery([
        zodParseDate(ProductSetSchema.shape.ProductSetInsertDate),
      ]).prefault(null),
      ToProductSetProductQuantity: zodQuery([
        zodParseNumber(ProductSetSchema.shape.ProductSetProductQuantity),
      ]).prefault(null),
    })
    .safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ExpressError(z.prettifyError(parsedQuery.error), 400);
  }

  const {
    FromProductSetInsertDate,
    FromProductSetProductQuantity,
    NewestRowsFirst,
    ProductID,
    RowsToReturn,
    RowsToSkip,
    ToProductSetInsertDate,
    ToProductSetProductQuantity,
  } = parsedQuery.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("ProductID", sql.UniqueIdentifier, ProductID)
    .input(
      "FromProductSetProductQuantity",
      sql.Int,
      FromProductSetProductQuantity,
    )
    .input("ToProductSetProductQuantity", sql.Int, ToProductSetProductQuantity)
    .input(
      "FromProductSetInsertDate",
      sql.DateTimeOffset(3),
      FromProductSetInsertDate,
    )
    .input(
      "ToProductSetInsertDate",
      sql.DateTimeOffset(3),
      ToProductSetInsertDate,
    )
    .input("RowsToSkip", sql.Int, RowsToSkip)
    .input("RowsToReturn", sql.Int, RowsToReturn)
    .input("NewestRowsFirst", sql.Bit, NewestRowsFirst)
    .execute<ProductSet>(USP_READ_PRODUCTSET)
    .then(({ recordset }) => {
      const parsedRecordset = ProductSetSchema.array().safeParse(recordset);

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
        USP_READ_PRODUCTSET,
        JSON.stringify({ CallingEndUserID, ...parsedQuery.data }),
      );
    });
};

export const updateProductSet = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = ProductSetSchema.pick({
    ParentProductID: true,
    ProductID: true,
  })
    .extend({
      ProductID: zodQuery([ProductSetSchema.shape.ProductID])
        .optional()
        .prefault(null),
    })
    .safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { ParentProductID, ProductID } = parsedParams.data;

  const parsedBody = ProductSetSchema.omit({
    ParentProductID: true,
    ProductID: true,
    ProductSetInsertDate: true,
  })
    .extend({
      ProductSetProductQuantity:
        ProductSetSchema.shape.ProductSetProductQuantity.nullable().prefault(
          null,
        ),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const { ProductSetProductQuantity } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("ParentProductID", sql.UniqueIdentifier, ParentProductID)
    .input("ProductID", sql.UniqueIdentifier, ProductID)
    .input("ProductSetProductQuantity", sql.Int, ProductSetProductQuantity)
    .execute<ProductSet>(USP_UPDATE_PRODUCTSET)
    .then(({ recordset }) => {
      const parsedRecordset = ProductSetSchema.safeExtend({
        OldProductSetProductQuantity:
          ProductSetSchema.shape.ProductSetProductQuantity,
      })
        .array()
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
        USP_UPDATE_PRODUCTSET,
        JSON.stringify({
          CallingEndUserID,
          ...parsedParams.data,
          ...parsedBody.data,
        }),
      );
    });
};

export const deleteProductSet = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = ProductSetSchema.pick({
    ParentProductID: true,
    ProductID: true,
  })
    .extend({
      ProductID: zodQuery([ProductSetSchema.shape.ProductID])
        .optional()
        .prefault(null),
    })
    .safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { ParentProductID, ProductID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("ParentProductID", sql.UniqueIdentifier, ParentProductID)
    .input("ProductID", sql.UniqueIdentifier, ProductID)
    .execute<ProductSet>(USP_DELETE_PRODUCTSET)
    .then(({ recordset }) => {
      const parsedRecordset = ProductSetSchema.array().safeParse(recordset);

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
        USP_DELETE_PRODUCTSET,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};
