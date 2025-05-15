import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { ValidationErrorItem } from "../middleware/response.middleware";

/**
 * Validates request data against a schema and provides detailed error messages
 *
 * @param schema Zod schema to validate against
 * @param source Where to find the data (body, params, query)
 */
export function validate(
  schema: z.ZodTypeAny,
  source: "body" | "params" | "query" = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data =
        source === "body"
          ? req.body
          : source === "params"
          ? req.params
          : req.query;

      const result = schema.safeParse(data);

      if (!result.success) {
        const zodErrors = result.error.format();
        const validationErrors: ValidationErrorItem[] = [];

        const extractErrors = (
          obj: Record<string, any>,
          parentPath: string = ""
        ) : void => {
          if (parentPath === "" && obj._errors) {
            return;
          }

          for (const key in obj) {
            if (key === "_errors") continue;

            const currentPath = parentPath ? `${parentPath}.${key}` : key;
            const fieldErrors = obj[key];

            if (fieldErrors._errors && fieldErrors._errors.length > 0) {
              validationErrors.push({
                field: currentPath,
                message: fieldErrors._errors[0],
                value: getNestedProperty(data, currentPath),
              });
            }

            if (
              typeof fieldErrors === "object" &&
              Object.keys(fieldErrors).length > 1
            ) {
              extractErrors(fieldErrors, currentPath);
            }
          }
        };

        extractErrors(zodErrors);

        // Send detailed validation errors
        res.status(StatusCodes.BAD_REQUEST).json({
          validationErrors,
        });
        return;
      }

      if (source === "body") {
        req.body = result.data;
      } else if (source === "params") {
        req.params = result.data;
      } else {
        req.query = result.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Helper function to get a nested property from an object by path
 */
function getNestedProperty(obj: any, path: string): any {
  const keys = path.split(".");
  return keys.reduce(
    (o, key) => (o && o[key] !== undefined ? o[key] : undefined),
    obj
  );
}
