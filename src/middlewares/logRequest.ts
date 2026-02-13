import { NextFunction, Request, Response } from "express";

const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const { ip, method, url } = req;

  console.log(
    `${new Date().toISOString()} ${ip ?? "undefined"} ${method} ${url}`,
  );

  next();
};

export default logRequest;
