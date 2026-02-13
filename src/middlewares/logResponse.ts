import { NextFunction, Request, Response } from "express";

const logResponse = (req: Request, res: Response, next: NextFunction) => {
  const { ip, method, url } = req;
  const { statusCode, statusMessage } = res;

  res.on("finish", () => {
    console.log(
      `${new Date().toISOString()} ${ip ?? "undefined"} ${method} ${url} ${statusCode.toFixed(0)} ${statusMessage}`,
    );
  });
  next();
};

export default logResponse;
