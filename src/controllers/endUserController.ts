import { Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import sql from "mssql";
import z from "zod";

import authenticationConfig from "../configs/authenticationConfig";
import {
  USP_CREATE_ENDUSER,
  USP_DELETE_ENDUSER,
  USP_READ_ENDUSER,
  USP_UPDATE_ENDUSER,
} from "../constants/StoredProcedureConstants";
import {
  TSQL_BIT_SCHEMA,
  TSQL_INT_SCHEMA,
} from "../constants/TSQLDataTypeConstants";
import { ExpressError } from "../middlewares/handleError";
import { EndUser, EndUserSchema } from "../models/EndUser";
import { Log } from "../models/Log";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import { objectOmitKeys } from "../utils/objectUtils";
import { zodParseDate, zodParseNumber, zodQuery } from "../utils/zodUtils";
import { usp_CreateLog } from "./logController";

const createEndUserRedactedKeys = new Set(["EndUserPassword"]);
export const createEndUser = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedBody = EndUserSchema.omit({
    EndUserID: true,
    EndUserRegisterDate: true,
  })
    .required({ EndUserPassword: true })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const { EmployeeID, EndUserName, EndUserPassword, EndUserRoleID } =
    parsedBody.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserName", sql.NVarChar(850), EndUserName)
    .input(
      "EndUserPassword",
      sql.NVarChar(sql.MAX),
      `${EndUserPassword}${authenticationConfig.salt}`,
    )
    .input("EndUserRoleID", sql.UniqueIdentifier, EndUserRoleID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .execute<EndUser>(USP_CREATE_ENDUSER)
    .then(({ recordset }) => {
      const parsedRecordset = EndUserSchema.omit({ EndUserPassword: true })
        .array()
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
        USP_CREATE_ENDUSER,
        JSON.stringify(
          objectOmitKeys(
            { CallingEndUserID, ...parsedBody.data },
            createEndUserRedactedKeys,
          ),
        ),
      );
    });
};

export const readEndUser = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = EndUserSchema.pick({
    EndUserID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { EndUserID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserID", sql.UniqueIdentifier, EndUserID)
    .execute<EndUser>(USP_READ_ENDUSER)
    .then(({ recordset }) => {
      const parsedRecordset = EndUserSchema.omit({ EndUserPassword: true })
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
        USP_READ_ENDUSER,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};

export const readEndUsers = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedQuery = EndUserSchema.omit({
    EndUserID: true,
    EndUserPassword: true,
    EndUserRegisterDate: true,
  })
    .extend({
      EmployeeID: zodQuery([EndUserSchema.shape.EmployeeID]).prefault(null),
      EndUserName: zodQuery([EndUserSchema.shape.EndUserName]).prefault(null),
      EndUserRoleID: zodQuery([EndUserSchema.shape.EndUserRoleID]).prefault(
        null,
      ),
    })
    .safeExtend({
      FromEndUserRegisterDate: zodQuery([
        zodParseDate(EndUserSchema.shape.EndUserRegisterDate),
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
      ToEndUserRegisterDate: zodQuery([
        zodParseDate(EndUserSchema.shape.EndUserRegisterDate),
      ]).prefault(null),
    })
    .safeParse(req.query);

  if (!parsedQuery.success) {
    throw new ExpressError(z.prettifyError(parsedQuery.error), 400);
  }

  const {
    EmployeeID,
    EndUserName,
    EndUserRoleID,
    FromEndUserRegisterDate,
    NewestRowsFirst,
    RowsToReturn,
    RowsToSkip,
    ToEndUserRegisterDate,
  } = parsedQuery.data;

  if (
    FromEndUserRegisterDate !== null &&
    ToEndUserRegisterDate !== null &&
    new Date(FromEndUserRegisterDate) > new Date(ToEndUserRegisterDate)
  ) {
    throw new ExpressError(
      "FromEndUserRegisterDate cannot be older than ToEndUserRegisterDate!",
      400,
    );
  }

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserName", sql.NVarChar(850), EndUserName)
    .input("EndUserRoleID", sql.UniqueIdentifier, EndUserRoleID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input(
      "FromEndUserRegisterDate",
      sql.DateTimeOffset(3),
      FromEndUserRegisterDate,
    )
    .input(
      "ToEndUserRegisterDate",
      sql.DateTimeOffset(3),
      ToEndUserRegisterDate,
    )
    .input("RowsToSkip", sql.Int, RowsToSkip)
    .input("RowsToReturn", sql.Int, RowsToReturn)
    .input("NewestRowsFirst", sql.Bit, NewestRowsFirst)
    .execute<EndUser>(USP_READ_ENDUSER)
    .then(({ recordset }) => {
      const parsedRecordset = EndUserSchema.omit({ EndUserPassword: true })
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
        USP_READ_ENDUSER,
        JSON.stringify({ CallingEndUserID, ...parsedQuery.data }),
      );
    });
};

export const updateEndUser = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = EndUserSchema.pick({
    EndUserID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { EndUserID } = parsedParams.data;

  const parsedBody = EndUserSchema.omit({
    EndUserID: true,
    EndUserPassword: true,
    EndUserRegisterDate: true,
  })
    .extend({
      EmployeeID: EndUserSchema.shape.EmployeeID.nullable().prefault(null),
      EndUserName: EndUserSchema.shape.EndUserName.nullable().prefault(null),
      EndUserRoleID:
        EndUserSchema.shape.EndUserRoleID.nullable().prefault(null),
    })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const { EmployeeID, EndUserName, EndUserRoleID } = parsedBody.data;

  if (EndUserName === null && EndUserRoleID === null && EmployeeID === null) {
    throw new ExpressError("Cannot update with only default values!", 400);
  }

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserID", sql.UniqueIdentifier, EndUserID)
    .input("EndUserName", sql.NVarChar(850), EndUserName)
    .input("EndUserRoleID", sql.UniqueIdentifier, EndUserRoleID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .execute<EndUser>(USP_UPDATE_ENDUSER)
    .then(({ recordset }) => {
      const parsedRecordset = EndUserSchema.omit({ EndUserPassword: true })
        .safeExtend({
          OldEmployeeID: EndUserSchema.shape.EmployeeID,
          OldEndUserName: EndUserSchema.shape.EndUserName,
          OldEndUserRoleID: EndUserSchema.shape.EndUserRoleID,
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
        USP_UPDATE_ENDUSER,
        JSON.stringify({
          CallingEndUserID,
          ...parsedParams.data,
          ...parsedBody.data,
        }),
      );
    });
};

export const deleteEndUser = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = EndUserSchema.pick({
    EndUserID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { EndUserID } = parsedParams.data;

  const storedProcedureStart: Log["LogStoredProcedureStart"] = new Date();
  let storedProcedureEnd: Log["LogStoredProcedureEnd"] | undefined;
  let storedProcedureSuccess: Log["LogStoredProcedureSuccess"] = 1;

  await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserID", sql.UniqueIdentifier, EndUserID)
    .execute<EndUser>(USP_DELETE_ENDUSER)
    .then(({ recordset }) => {
      const parsedRecordset = EndUserSchema.omit({ EndUserPassword: true })
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
        USP_DELETE_ENDUSER,
        JSON.stringify({ CallingEndUserID, ...parsedParams.data }),
      );
    });
};
