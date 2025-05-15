import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async route handler and automatically handles the return value.
 * If the handler returns a value, it will be sent via res.json() (to be intercepted by your formatter).
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => any
): RequestHandler => {
  return async (req, res, next) => {
    try {
      const result = await fn(req, res, next);
      if (res.headersSent) return;
      if (typeof result !== "undefined") {
        res.json(result);
      }
    } catch (err) {
      next(err);
    }
  };
};
