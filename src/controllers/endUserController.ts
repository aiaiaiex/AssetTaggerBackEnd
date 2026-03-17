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
} from "../constants/StoredProceduresConstants";
import { ExpressError } from "../middlewares/handleError";
import { EndUser, EndUserSchema } from "../models/EndUser";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";
import {
  zodCombineUnionErrorMessages,
  zodParseNull,
  zodParseNumber,
} from "../utils/zodUtils";

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

  const { recordset } = await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserName", sql.NVarChar(4000), EndUserName)
    .input(
      "EndUserPassword",
      sql.NVarChar(sql.MAX),
      `${EndUserPassword}${authenticationConfig.salt}`,
    )
    .input("EndUserRoleID", sql.UniqueIdentifier, EndUserRoleID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .execute<EndUser>(USP_CREATE_ENDUSER);

  const parsedRecordset = EndUserSchema.omit({ EndUserPassword: true })
    .array()
    .length(1)
    .safeParse(recordset);

  if (!parsedRecordset.success) {
    throw new ExpressError(z.prettifyError(parsedRecordset.error), 500);
  }

  res.json(parsedRecordset.data[0]);
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

  const { recordset } = await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserID", sql.UniqueIdentifier, EndUserID)
    .execute<EndUser>(USP_READ_ENDUSER);

  const parsedRecordset = EndUserSchema.omit({ EndUserPassword: true })
    .array()
    .max(1)
    .safeParse(recordset);

  if (!parsedRecordset.success) {
    throw new ExpressError(z.prettifyError(parsedRecordset.error), 500);
  }

  res.json(parsedRecordset.data[0]);
};

export const readEndUsers = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedQuery = EndUserSchema.omit({
    EndUserID: true,
    EndUserPassword: true,
    EndUserRegisterDate: true,
  })
    .extend({
      EmployeeID: z
        .xor([zodParseNull(), EndUserSchema.shape.EmployeeID], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      EndUserName: z
        .xor([zodParseNull(), EndUserSchema.shape.EndUserName], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      EndUserRoleID: z
        .xor([zodParseNull(), EndUserSchema.shape.EndUserRoleID], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
    })
    .safeExtend({
      FromEndUserRegisterDate: z
        .xor([zodParseNull(), z.iso.datetime(), z.iso.date()], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      NewestRowsFirst: z
        .xor([zodParseNull(), zodParseNumber(z.int().min(0).max(1))], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      // The maximum integer is 2,147,483,647 because it is the upper limit of INT in T-SQL.
      // See more:
      // https://learn.microsoft.com/en-us/sql/t-sql/data-types/int-bigint-smallint-and-tinyint-transact-sql
      RowsToReturn: z
        .xor([zodParseNumber(z.int().min(1).max(2147483647)), zodParseNull()], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      RowsToSkip: z
        .xor([zodParseNumber(z.int().min(0).max(2147483647)), zodParseNull()], {
          error: zodCombineUnionErrorMessages,
        })
        .prefault(null),
      ToEndUserRegisterDate: z
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
      "FromEndUserRegisterDate cannot be later than ToEndUserRegisterDate!",
      400,
    );
  }

  const { recordset } = await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserName", sql.NVarChar(4000), EndUserName)
    .input("EndUserRoleID", sql.UniqueIdentifier, EndUserRoleID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input("FromEndUserRegisterDate", sql.DateTime, FromEndUserRegisterDate)
    .input("ToEndUserRegisterDate", sql.DateTime, ToEndUserRegisterDate)
    .input("RowsToSkip", sql.Int, RowsToSkip)
    .input("RowsToReturn", sql.Int, RowsToReturn)
    .input("NewestRowsFirst", sql.Bit, NewestRowsFirst)
    .execute<EndUser>(USP_READ_ENDUSER);

  const parsedRecordset = EndUserSchema.omit({ EndUserPassword: true })
    .array()
    .safeParse(recordset);

  if (!parsedRecordset.success) {
    throw new ExpressError(z.prettifyError(parsedRecordset.error), 500);
  }

  res.json(parsedRecordset.data);
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

  const { recordset } = await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserID", sql.UniqueIdentifier, EndUserID)
    .input("EndUserName", sql.NVarChar(4000), EndUserName)
    .input("EndUserRoleID", sql.UniqueIdentifier, EndUserRoleID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .execute<EndUser>(USP_UPDATE_ENDUSER);

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

  const { recordset } = await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserID", sql.UniqueIdentifier, EndUserID)
    .execute<EndUser>(USP_DELETE_ENDUSER);

  const parsedRecordset = EndUserSchema.omit({ EndUserPassword: true })
    .array()
    .max(1)
    .safeParse(recordset);

  if (!parsedRecordset.success) {
    throw new ExpressError(z.prettifyError(parsedRecordset.error), 500);
  }

  res.json(parsedRecordset.data[0]);
};
