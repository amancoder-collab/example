import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "@/shared/exceptions";

/**
 * Global validator options specifying which part of the request to validate
 */
export interface ValidatorOptions {
  source?: "body" | "params" | "query" | "all";
}

/**
 * Creates a validator middleware that can validate different parts of the request
 * based on the provided schema and options.
 *
 * @param schema - The Zod schema to validate against
 * @param options - Options to specify which part of the request to validate
 * @returns Express middleware function
 */
export const validate = <T extends z.ZodTypeAny>(
  schema: T,
  options: ValidatorOptions = { source: "body" }
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let result;

      switch (options.source) {
        case "params":
          result = schema.parse(req.params);
          req.params = result;
          break;
        case "query":
          result = schema.parse(req.query);
          req.query = result;
          break;
        case "all":
          // Validate all parts of the request
          const allData = {
            body: req.body,
            params: req.params,
            query: req.query,
          };
          result = schema.parse(allData);
          req.body = result.body;
          req.params = result.params;
          req.query = result.query;
          break;
        default:
          // Default to validating the body
          result = schema.parse(req.body);
          req.body = result;
      }

      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        next(
          AppError.badRequest(error.errors?.[0]?.message || "Validation failed")
        );
      } else {
        next(AppError.badRequest("Validation failed"));
      }
    }
  };
};
