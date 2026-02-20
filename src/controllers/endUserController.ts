import { Request, Response } from "express";
import sql from "mssql";
import z from "zod";

import { ExpressError } from "../middlewares/handleError";
import { EndUser, EndUserSchema } from "../models/EndUser";

export const createEndUser = async (req: Request, res: Response) => {
  const reqRes = EndUserSchema.omit({
    EndUserID: true,
    EndUserPasswordHash: true,
  })
    .required({ EndUserPassword: true })
    .safeParse(req.body);

  if (!reqRes.success) {
    throw new ExpressError(z.prettifyError(reqRes.error), 400);
  }

  const { EmployeeID, EndUserName, EndUserPassword, EndUserRoleID } =
    reqRes.data;

  const { recordset } = await req.app.locals.database
    .request()
    .input("EndUserName", sql.NVarChar(50), EndUserName)
    .input("EndUserPassword", sql.NVarChar(255), EndUserPassword)
    .input("EndUserRoleID", sql.UniqueIdentifier, EndUserRoleID)
    .input("EmployeeID", sql.UniqueIdentifier, EmployeeID)
    // .output("EndUserID", sql.UniqueIdentifier)  // TODO Find out why this doesn't work.
    .execute<EndUser>("usp_CreateEndUser");

  const databaseRes = EndUserSchema.omit({ EndUserPasswordHash: true })
    .array()
    .length(1)
    .safeParse(recordset);

  if (!databaseRes.success) {
    throw new ExpressError(z.prettifyError(databaseRes.error), 500);
  }

  res.json(databaseRes.data[0]);
};
