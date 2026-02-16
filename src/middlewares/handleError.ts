import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import z from "zod";

const StatusCodeSchema = z.int().gte(400).lte(599);

type StatusCode = z.infer<typeof StatusCodeSchema>;

export class ExpressError extends Error {
  public readonly statusCode?: StatusCode;
  public readonly statusMessage?: string;

  constructor(
    message?: string,
    statusCode?: StatusCode,
    statusMessage?: string,
  ) {
    super(message);

    this.name = "ExpressError";

    const result = StatusCodeSchema.optional().safeParse(statusCode);

    if (result.success) {
      this.statusCode = result.data;
    }

    this.statusMessage = statusMessage;

    Object.setPrototypeOf(this, ExpressError.prototype);
  }
}

const handleError: ErrorRequestHandler = (
  err: Error | ExpressError,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ExpressError) {
    if (err.statusMessage) {
      res.statusMessage = err.statusMessage;
    }

    res.status(err.statusCode ?? 500).json({
      message: err.message,
    });
  } else {
    res.status(500).json({
      message: err.message,
    });
  }
};

export default handleError;
