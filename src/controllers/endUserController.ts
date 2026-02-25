import { Request, Response } from "express";
import sql from "mssql";
import z from "zod";

import { ExpressError } from "../middlewares/handleError";
import { EndUser, EndUserSchema } from "../models/EndUser";
import { zodStringToNumber } from "../utils/zodUtils";

export const createEndUser = async (req: Request, res: Response) => {
  const input = EndUserSchema.omit({
    EndUserID: true,
    EndUserPasswordHash: true,
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
    .input("EndUserName", sql.NVarChar(50), EndUserName)
    .input("EndUserPassword", sql.NVarChar(255), EndUserPassword)
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
  const input = EndUserSchema.pick({
    EndUserID: true,
  }).safeParse(req.params);

  if (!input.success) {
    throw new ExpressError(z.prettifyError(input.error), 400);
  }

  const { EndUserID } = input.data;

  const { recordset } = await req.app.locals.database
    .request()
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
  const input = EndUserSchema.omit({
    EndUserID: true,
    EndUserPassword: true,
    EndUserPasswordHash: true,
  })
    .extend({
      // EndUserName and *ID queries can only become null when not used (i.e., undefined).
      EmployeeID: EndUserSchema.shape.EmployeeID.prefault(null),
      EndUserName: EndUserSchema.shape.EndUserName.nullable().prefault(null),
      EndUserRoleID: EndUserSchema.shape.EndUserRoleID.prefault(null),
      // Default to 1 (true) whet Get* queries are used with empty strings.
      GetOnlyNonNullEmployeeID: zodStringToNumber(z.int().min(0).max(1), 0, 1),
      GetOnlyNonNullEndUserRoleID: zodStringToNumber(
        z.int().min(0).max(1),
        0,
        1,
      ),
      GetOnlyNullEmployeeID: zodStringToNumber(z.int().min(0).max(1), 0, 1),
      GetOnlyNullEndUserRoleID: zodStringToNumber(z.int().min(0).max(1), 0, 1),
    })
    .safeParse(req.query);

  if (!input.success) {
    throw new ExpressError(z.prettifyError(input.error), 400);
  }

  const {
    EmployeeID,
    EndUserName,
    EndUserRoleID,
    GetOnlyNonNullEmployeeID,
    GetOnlyNonNullEndUserRoleID,
    GetOnlyNullEmployeeID,
    GetOnlyNullEndUserRoleID,
  } = input.data;

  if (EndUserRoleID !== null && GetOnlyNullEndUserRoleID === 1) {
    throw new ExpressError(
      "Cannot get rows with null EndUserRoleID when EndUserRoleID query is used!",
      400,
    );
  } else if (EndUserRoleID !== null && GetOnlyNonNullEndUserRoleID === 1) {
    throw new ExpressError(
      "Cannot get all rows with non-null EndUserRoleID when EndUserRoleID query is used!",
      400,
    );
  } else if (EmployeeID !== null && GetOnlyNullEmployeeID === 1) {
    throw new ExpressError(
      "Cannot get rows with null EmployeeID when EmployeeID query is used!",
      400,
    );
  } else if (EmployeeID !== null && GetOnlyNonNullEmployeeID === 1) {
    throw new ExpressError(
      "Cannot get all rows with non-null EmployeeID when EmployeeID query is used!",
      400,
    );
  } else if (
    GetOnlyNullEndUserRoleID === 1 &&
    GetOnlyNonNullEndUserRoleID === 1
  ) {
    throw new ExpressError(
      "GetOnlyNullEndUserRoleID and GetOnlyNonNullEndUserRoleID cannot be both 1!",
      400,
    );
  } else if (GetOnlyNullEmployeeID === 1 && GetOnlyNonNullEmployeeID === 1) {
    throw new ExpressError(
      "GetOnlyNullEmployeeID and GetOnlyNonNullEmployeeID cannot be both 1!",
      400,
    );
  }

  const { recordset } = await req.app.locals.database
    .request()
    .input("EndUserName", sql.NVarChar(50), EndUserName)
    .input("EndUserRoleID", sql.UniqueIdentifier, EndUserRoleID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input("GetOnlyNullEndUserRoleID", sql.Bit, GetOnlyNullEndUserRoleID)
    .input("GetOnlyNullEmployeeID", sql.Bit, GetOnlyNullEmployeeID)
    .input("GetOnlyNonNullEndUserRoleID", sql.Bit, GetOnlyNonNullEndUserRoleID)
    .input("GetOnlyNonNullEmployeeID", sql.Bit, GetOnlyNonNullEmployeeID)
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
  })
    .extend({
      EndUserName: EndUserSchema.shape.EndUserName.nullable(),
      NullifyEmployeeID: z.int().min(0).max(1).prefault(0),
      NullifyEndUserRoleID: z.int().min(0).max(1).prefault(0),
    })
    .safeParse(req.body);

  if (!bodyInput.success) {
    throw new ExpressError(z.prettifyError(bodyInput.error), 400);
  }

  const {
    EmployeeID,
    EndUserName,
    EndUserRoleID,
    NullifyEmployeeID,
    NullifyEndUserRoleID,
  } = bodyInput.data;

  if (
    !(
      EndUserName ||
      EndUserRoleID ||
      EmployeeID ||
      NullifyEndUserRoleID ||
      NullifyEmployeeID
    )
  ) {
    throw new ExpressError("Cannot update without values!", 400);
  } else if (
    (NullifyEndUserRoleID && EndUserRoleID) ||
    (NullifyEmployeeID && EmployeeID)
  ) {
    throw new ExpressError("Cannot nullify with a non-null value!", 400);
  }

  const { recordset } = await req.app.locals.database
    .request()
    .input("EndUserID", sql.UniqueIdentifier, EndUserID)
    .input("EndUserName", sql.NVarChar(50), EndUserName)
    .input("EndUserRoleID", sql.UniqueIdentifier, EndUserRoleID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    .input("NullifyEndUserRoleID", sql.Bit, NullifyEndUserRoleID)
    .input("NullifyEmployeeID", sql.Bit, NullifyEmployeeID)
    .execute<EndUser>("usp_UpdateEndUser");

  const output = EndUserSchema.omit({
    EndUserPassword: true,
    EndUserPasswordHash: true,
  })
    .extend({
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
  const input = EndUserSchema.pick({
    EndUserID: true,
  }).safeParse(req.params);

  if (!input.success) {
    throw new ExpressError(z.prettifyError(input.error), 400);
  }

  const { EndUserID } = input.data;

  const { recordset } = await req.app.locals.database
    .request()
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
