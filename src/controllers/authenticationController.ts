import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import sql from "mssql";
import z from "zod";

import authenticationConfig from "../configs/authenticationConfig";
import { ExpressError } from "../middlewares/handleError";
import { Authentication } from "../models/Authentication";
import { EndUser, EndUserSchema } from "../models/EndUser";

export const createAuthentication = async (req: Request, res: Response) => {
  const parsedBody = EndUserSchema.pick({
    EndUserName: true,
    EndUserPassword: true,
  })
    .required({ EndUserPassword: true })
    .safeParse(req.body);

  if (!parsedBody.success) {
    throw new ExpressError(z.prettifyError(parsedBody.error), 400);
  }

  const { EndUserName, EndUserPassword } = parsedBody.data;

  const { recordset } = await req.app.locals.database
    .request()
    .input("EndUserName", sql.NVarChar(4000), EndUserName)
    .input(
      "EndUserPassword",
      sql.NVarChar(4000),
      `${EndUserPassword}${authenticationConfig.salt}`,
    )
    .execute<EndUser>("usp_CreateAuthentication");

  const parsedRecordset = EndUserSchema.pick({
    EndUserID: true,
  })
    .array()
    .length(1)
    .safeParse(recordset);

  if (!parsedRecordset.success) {
    throw new ExpressError("Invalid credentials!", 401);
  }

  const { EndUserID } = parsedRecordset.data[0];

  const payload: Authentication = { CallingEndUserID: EndUserID };

  const token = jwt.sign(payload, authenticationConfig.secret, {
    algorithm: authenticationConfig.algorithms,
    expiresIn: authenticationConfig.expiresIn,
  });

  res.cookie(
    authenticationConfig.cookieAccessTokenName,
    token,
    authenticationConfig.cookieOptions,
  );

  res.status(200).end();
};
