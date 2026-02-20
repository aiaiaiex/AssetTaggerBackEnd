import { Request, Response } from "express";

import { DatabaseServer, DatabaseServerSchema } from "../models/DatabaseServer";
import { Root } from "../models/Root";

export const readRoot = async (req: Request, res: Response) => {
  const output: Root = { databaseReachable: true };

  const { recordset } = await req.app.locals.database.query<DatabaseServer>(
    "SELECT @@SERVERNAME AS 'ServerName'",
  );

  const result = DatabaseServerSchema.pick({ ServerName: true })
    .array()
    .length(1)
    .safeParse(recordset);

  if (!result.success) {
    res.status(500);
    output.databaseReachable = false;
  }

  res.json(output);
};
