import { Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import sql from "mssql";
import z from "zod";

import {
  USP_CREATE_BUILDING,
  USP_DELETE_BUILDING,
  USP_READ_BUILDING,
  USP_UPDATE_BUILDING,
} from "../constants/StoredProcedureConstants";
import {
  TSQL_BIT_SCHEMA,
  TSQL_INT_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { ExpressError } from "../middlewares/handleError";
import { Building, BuildingSchema } from "../models/Building";
import { Log } from "../models/Log";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import { zodParseDate, zodParseNumber, zodQuery } from "../utils/zodUtils";
import { usp_CreateLog } from "./logController";

export const createBuilding = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedBody = BuildingSchema.omit({
    BuildingID: true,
    BuildingInsertDate: true,
  }).safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const { BuildingAddress, BuildingName, CompanyID } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("BuildingName", sql.NVarChar(850), BuildingName)
    .input("BuildingAddress", sql.NVarChar(850), BuildingAddress)
    .input("CompanyID", sql.UniqueIdentifier, CompanyID)
    .execute<Building>(USP_CREATE_BUILDING)
    .then(({ recordset }) => {
      const parsedRecordset = BuildingSchema.array()
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
        USP_CREATE_BUILDING,
        JSON.stringify({ CallingEndUserID, ...parsedBody.data }),
      );
    });
};

export const readBuilding = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = BuildingSchema.pick({
    BuildingID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { BuildingID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("BuildingID", sql.UniqueIdentifier, BuildingID)
    .execute<Building>(USP_READ_BUILDING)
    .then(({ recordset }) => {
      const parsedRecordset = BuildingSchema.array()
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
        USP_READ_BUILDING,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};

export const readBuildings = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedQuery = BuildingSchema.omit({
    BuildingID: true,
    BuildingInsertDate: true,
  })
    .extend({
      BuildingAddress: zodQuery([
        BuildingSchema.shape.BuildingAddress,
      ]).prefault(null),
      BuildingName: zodQuery([BuildingSchema.shape.BuildingName]).prefault(
        null,
      ),
      CompanyID: zodQuery([BuildingSchema.shape.CompanyID]).prefault(null),
    })
    .safeExtend({
      FromBuildingInsertDate: zodQuery([
        zodParseDate(BuildingSchema.shape.BuildingInsertDate),
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
      ToBuildingInsertDate: zodQuery([
        zodParseDate(BuildingSchema.shape.BuildingInsertDate),
      ]).prefault(null),
    })
    .safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ExpressError(z.prettifyError(parsedQuery.error), 400);
  }

  const {
    BuildingAddress,
    BuildingName,
    CompanyID,
    FromBuildingInsertDate,
    NewestRowsFirst,
    RowsToReturn,
    RowsToSkip,
    ToBuildingInsertDate,
  } = parsedQuery.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("BuildingName", sql.NVarChar(850), BuildingName)
    .input("BuildingAddress", sql.NVarChar(850), BuildingAddress)
    .input("CompanyID", sql.UniqueIdentifier, CompanyID)
    .input(
      "FromBuildingInsertDate",
      sql.DateTimeOffset(3),
      FromBuildingInsertDate,
    )
    .input("ToBuildingInsertDate", sql.DateTimeOffset(3), ToBuildingInsertDate)
    .input("RowsToSkip", sql.Int, RowsToSkip)
    .input("RowsToReturn", sql.Int, RowsToReturn)
    .input("NewestRowsFirst", sql.Bit, NewestRowsFirst)
    .execute<Building>(USP_READ_BUILDING)
    .then(({ recordset }) => {
      const parsedRecordset = BuildingSchema.array().safeParse(recordset);

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
        USP_READ_BUILDING,
        JSON.stringify({ CallingEndUserID, ...parsedQuery.data }),
      );
    });
};

export const updateBuilding = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = BuildingSchema.pick({
    BuildingID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { BuildingID } = parsedParams.data;

  const parsedBody = BuildingSchema.omit({
    BuildingID: true,
    BuildingInsertDate: true,
  })
    .extend({
      BuildingAddress:
        BuildingSchema.shape.BuildingAddress.nullable().prefault(null),
      BuildingName: BuildingSchema.shape.BuildingName.nullable().prefault(null),
      CompanyID: BuildingSchema.shape.CompanyID.nullable().prefault(null),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const { BuildingAddress, BuildingName, CompanyID } = parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("BuildingID", sql.UniqueIdentifier, BuildingID)
    .input("BuildingName", sql.NVarChar(850), BuildingName)
    .input("BuildingAddress", sql.NVarChar(850), BuildingAddress)
    .input("CompanyID", sql.UniqueIdentifier, CompanyID)
    .execute<Building>(USP_UPDATE_BUILDING)
    .then(({ recordset }) => {
      const parsedRecordset = BuildingSchema.safeExtend({
        OldBuildingAddress: BuildingSchema.shape.BuildingAddress,
        OldBuildingName: BuildingSchema.shape.BuildingName,
        OldCompanyID: BuildingSchema.shape.CompanyID,
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
        USP_UPDATE_BUILDING,
        JSON.stringify({
          CallingEndUserID,
          ...parsedParams.data,
          ...parsedBody.data,
        }),
      );
    });
};

export const deleteBuilding = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = BuildingSchema.pick({
    BuildingID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { BuildingID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("BuildingID", sql.UniqueIdentifier, BuildingID)
    .execute<Building>(USP_DELETE_BUILDING)
    .then(({ recordset }) => {
      const parsedRecordset = BuildingSchema.array()
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
        USP_DELETE_BUILDING,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};
