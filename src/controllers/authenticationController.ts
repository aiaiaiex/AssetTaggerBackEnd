import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import sql from "mssql";
import z from "zod";

import authenticationConfig from "../configs/authenticationConfig";
import { ExpressError } from "../middlewares/handleError";
import { EndUser, EndUserSchema } from "../models/EndUser";

export const logInEndUser = async (req: Request, res: Response) => {
  const input = EndUserSchema.pick({
    EndUserName: true,
    EndUserPassword: true,
  })
    .required({ EndUserPassword: true })
    .safeParse(req.body);

  if (!input.success) {
    throw new ExpressError(z.prettifyError(input.error), 400);
  }

  const { EndUserName, EndUserPassword } = input.data;

  const { recordset } = await req.app.locals.database
    .request()
    .input("EndUserName", sql.NVarChar(4000), EndUserName)
    .input(
      "EndUserPassword",
      sql.NVarChar(4000),
      `${EndUserPassword}${authenticationConfig.salt}`,
    )
    .execute<EndUser>("usp_LoginEndUser");

  const output = EndUserSchema.pick({
    EndUserID: true,
  })
    .array()
    .length(1)
    .safeParse(recordset);

  if (!output.success) {
    throw new ExpressError(z.prettifyError(output.error), 401);
  }

  const { EndUserID } = output.data[0];

  const token = jwt.sign(
    { EndUserID: EndUserID },
    authenticationConfig.secret,
    {
      algorithm: authenticationConfig.algorithms,
      expiresIn: authenticationConfig.expiresIn,
    },
  );

  res.cookie("access_token", token, authenticationConfig.cookieOptions);

  res.status(200).end();
};
