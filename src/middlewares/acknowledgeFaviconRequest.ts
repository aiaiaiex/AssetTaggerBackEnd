import { NextFunction, Request, Response } from "express";

const acknowledgeFaviconRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.originalUrl.split("/").pop() === "favicon.ico") {
    res.status(204).end();
  }

  next();
};

export default acknowledgeFaviconRequest;
