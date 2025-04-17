import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/infrastructure/logger/logger.service";
import { ErrorWithStatus, AppError } from "./app.error";

export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = err as ErrorWithStatus;
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  if (process.env.NODE_ENV === "development") {
    logger.error("Error", {
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });

    // Format error response according to API standard
    res.status(statusCode).json({
      success: false,
      message: "",
      error: error.message,
      data: {},
      meta: {},
    });
  } else {
    // Production mode
    logger.error("Error 💥", { error });

    // Operational, trusted error: send message to client
    if (error.isOperational) {
      res.status(statusCode).json({
        success: false,
        message: "",
        error: error.message,
        data: {},
        meta: {},
      });
    } else {
      // Programming or other unknown error: don't leak error details
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "",
        error: "Internal Server Error",
        data: {},
        meta: {},
      });
    }
  }
};
