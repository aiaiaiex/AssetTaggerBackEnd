import { Request, Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import jwt from "jsonwebtoken";
import sql from "mssql";
import z from "zod";

import authenticationConfig from "../configs/authenticationConfig";
import { USP_CREATE_AUTHENTICATION } from "../constants/StoredProceduresConstants";
import { ExpressError } from "../middlewares/handleError";
import { Authentication } from "../models/Authentication";
import { EndUser, EndUserSchema } from "../models/EndUser";
import { expressJWTGetPayload } from "../utils/expressJWTUtils";

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
      sql.NVarChar(sql.MAX),
      `${EndUserPassword}${authenticationConfig.salt}`,
    )
    .execute<EndUser>(USP_CREATE_AUTHENTICATION);

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

  const payload: Authentication = {
    CallingEndUserID: EndUserID,
    CallingEndUserIP: authenticationConfig.ipInPayload
      ? (req.ip ?? null)
      : null,
  };

  const token = jwt.sign(payload, authenticationConfig.secret, {
    algorithm: authenticationConfig.algorithms,
    expiresIn: authenticationConfig.expiresIn,
  });

  res.cookie(
    authenticationConfig.cookieAccessTokenName,
    token,
    authenticationConfig.cookieOptions,
  );

  res.json(payload);
};

export const deleteAuthentication = async (req: JWTRequest, res: Response) => {
  const { CallingEndUserID } = expressJWTGetPayload(req.auth);

  const parsedParams = EndUserSchema.pick({
    EndUserID: true,
  }).safeParse(req.params);

  if (!parsedParams.success) {
    throw new ExpressError(z.prettifyError(parsedParams.error), 400);
  }

  const { EndUserID } = parsedParams.data;

  if (CallingEndUserID !== EndUserID) {
    throw new ExpressError("Unauthorized!", 401);
  }

  res.clearCookie(
    authenticationConfig.cookieAccessTokenName,
    authenticationConfig.cookieOptions,
  );

  res.status(200).end();
};
