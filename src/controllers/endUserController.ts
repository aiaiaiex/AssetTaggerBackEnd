import { Response } from "express";
import { Request } from "express-jwt";
import sql from "mssql";
import z from "zod";

import { ExpressError } from "../middlewares/handleError";
import { EndUser, EndUserSchema } from "../models/EndUser";
import { expressJWTGetEndUserID } from "../utils/expressJWTUtils";
import {
  zodCombineUnionErrorMessages,
  zodParseNull,
  zodParseNumber,
} from "../utils/zodUtils";

export const createEndUser = async (req: Request, res: Response) => {
  const CallingEndUserID = expressJWTGetEndUserID(req.auth);

  const input = EndUserSchema.omit({
    EndUserID: true,
    EndUserPasswordHash: true,
    EndUserRegisterDate: true,
  })
    .required({ EndUserPassword: true })
    .safeParse(req.body);

  if (!input.success) {
    throw new ExpressError(z.prettifyError(input.error), 400);
  }

  const { EmployeeID, EndUserName, EndUserPassword, EndUserRoleID } =
    input.data;

  const { recordset } = await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserName", sql.NVarChar(4000), EndUserName)
    .input("EndUserPassword", sql.NVarChar(4000), EndUserPassword)
    .input("EndUserRoleID", sql.UniqueIdentifier, EndUserRoleID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .execute<EndUser>("usp_CreateEndUser");

  const output = EndUserSchema.omit({
    EndUserPassword: true,
    EndUserPasswordHash: true,
  })
    .array()
    .length(1)
    .safeParse(recordset);

  if (!output.success) {
    throw new ExpressError(z.prettifyError(output.error), 500);
  }

  res.json(output.data[0]);
};

export const readEndUser = async (req: Request, res: Response) => {
  const CallingEndUserID = expressJWTGetEndUserID(req.auth);

  const input = EndUserSchema.pick({
    EndUserID: true,
  }).safeParse(req.params);

  if (!input.success) {
    throw new ExpressError(z.prettifyError(input.error), 400);
  }

  const { EndUserID } = input.data;

  const { recordset } = await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserID", sql.UniqueIdentifier, EndUserID)
    .execute<EndUser>("usp_ReadEndUser");

  const output = EndUserSchema.omit({
    EndUserPassword: true,
    EndUserPasswordHash: true,
  })
    .array()
    .max(1)
    .safeParse(recordset);

  if (!output.success) {
    throw new ExpressError(z.prettifyError(output.error), 500);
  }

  res.json(output.data[0]);
};

export const readEndUsers = async (req: Request, res: Response) => {
  const CallingEndUserID = expressJWTGetEndUserID(req.auth);

  const input = EndUserSchema.omit({
    EndUserID: true,
    EndUserPassword: true,
    EndUserPasswordHash: true,
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

  if (!input.success) {
    throw new ExpressError(z.prettifyError(input.error), 400);
  }

  const {
    EmployeeID,
    EndUserName,
    EndUserRoleID,
    FromEndUserRegisterDate,
    RowsToReturn,
    RowsToSkip,
    ToEndUserRegisterDate,
  } = input.data;

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
    .execute<EndUser>("usp_ReadEndUser");

  const output = EndUserSchema.omit({
    EndUserPassword: true,
    EndUserPasswordHash: true,
  })
    .array()
    .safeParse(recordset);

  if (!output.success) {
    throw new ExpressError(z.prettifyError(output.error), 500);
  }

  res.json(output.data);
};

export const updateEndUser = async (req: Request, res: Response) => {
  const CallingEndUserID = expressJWTGetEndUserID(req.auth);

  const paramsInput = EndUserSchema.pick({
    EndUserID: true,
  }).safeParse(req.params);

  if (!paramsInput.success) {
    throw new ExpressError(z.prettifyError(paramsInput.error), 400);
  }

  const { EndUserID } = paramsInput.data;

  const bodyInput = EndUserSchema.omit({
    EndUserID: true,
    EndUserPassword: true,
    EndUserPasswordHash: true,
    EndUserRegisterDate: true,
  })
    .extend({
      EmployeeID: EndUserSchema.shape.EmployeeID.nullable().prefault(null),
      EndUserName: EndUserSchema.shape.EndUserName.nullable().prefault(null),
      EndUserRoleID:
        EndUserSchema.shape.EndUserRoleID.nullable().prefault(null),
    })
    .safeParse(req.body);

  if (!bodyInput.success) {
    throw new ExpressError(z.prettifyError(bodyInput.error), 400);
  }

  const { EmployeeID, EndUserName, EndUserRoleID } = bodyInput.data;

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
    .execute<EndUser>("usp_UpdateEndUser");

  const output = EndUserSchema.omit({
    EndUserPassword: true,
    EndUserPasswordHash: true,
  })
    .safeExtend({
      OldEmployeeID: EndUserSchema.shape.EmployeeID,
      OldEndUserName: EndUserSchema.shape.EndUserName,
      OldEndUserRoleID: EndUserSchema.shape.EndUserRoleID,
    })
    .array()
    .max(1)
    .safeParse(recordset);

  if (!output.success) {
    throw new ExpressError(z.prettifyError(output.error), 500);
  }

  res.json(output.data[0]);
};

export const deleteEndUser = async (req: Request, res: Response) => {
  const CallingEndUserID = expressJWTGetEndUserID(req.auth);

  const input = EndUserSchema.pick({
    EndUserID: true,
  }).safeParse(req.params);

  if (!input.success) {
    throw new ExpressError(z.prettifyError(input.error), 400);
  }

  const { EndUserID } = input.data;

  const { recordset } = await req.app.locals.database
    .request()
    .input("CallingEndUserID", sql.UniqueIdentifier, CallingEndUserID)
    .input("EndUserID", sql.UniqueIdentifier, EndUserID)
    .execute<EndUser>("usp_DeleteEndUser");

  const output = EndUserSchema.omit({
    EndUserPassword: true,
    EndUserPasswordHash: true,
  })
    .array()
    .max(1)
    .safeParse(recordset);

  if (!output.success) {
    throw new ExpressError(z.prettifyError(output.error), 500);
  }

  res.json(output.data[0]);
};
