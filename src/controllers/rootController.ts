import { Request, Response } from "express";
import z from "zod";

import { DatabaseServer, DatabaseServerSchema } from "../models/DatabaseServer";

export const ping = async (req: Request, res: Response) => {
  const jsonRes: {
    errorMessage?: string;
    message: string;
    serverName?: z.infer<typeof DatabaseServerSchema.shape.ServerName>;
  } = { message: "Back-end server is pingable." };

  const { recordset } = await req.app.locals.database.query<DatabaseServer>(
    "SELECT @@SERVERNAME AS 'ServerName'",
  );

  const result = DatabaseServerSchema.pick({ ServerName: true })
    .array()
    .length(1)
    .safeParse(recordset);

  if (!result.success) {
    res.status(500);
    jsonRes.message =
      "Back-end server is pingable BUT Microsoft SQL Server name is NOT available!";
    jsonRes.errorMessage = z.prettifyError(result.error);
  } else {
    jsonRes.serverName = result.data[0].ServerName;
  }

  res.json(jsonRes);
};
