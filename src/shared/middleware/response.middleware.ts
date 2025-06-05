import { NextFunction, Request, Response } from "express";

/**
 * API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  error: string;
  data: T;
  meta: Record<string, any>;
}

/**
 * Detailed validation error format for field-level errors
 */
export interface ValidationErrorItem {
  field: string;
  message: string;
  value?: any;
}

/**
 * Simple middleware that overrides res.json to format all responses in a consistent way
 * This eliminates the need for interceptors or controller wrappers
 */
export function responseFormatter() {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    const originalSend = res.send;

    // Helper to check if object is a validation error
    const isValidationError = (obj: any): boolean => {
      return (
        obj &&
        typeof obj === "object" &&
        obj.validationErrors &&
        Array.isArray(obj.validationErrors)
      );
    };

    // Add success method to response object
    res.success = function<T>(data: T): Response {
      return res.json({
        success: true,
        message: "",
        error: "",
        data,
        meta: {},
      });
    };

    res.json = function (body: any): Response {
      // Don't modify responses that are already in our format
      if (
        body &&
        typeof body === "object" &&
        "success" in body &&
        "data" in body &&
        "message" in body &&
        "error" in body
      ) {
        return originalJson.call(this, body);
      }

      const statusCode = res.statusCode;
      if (statusCode >= 400) {
        // Handle validation errors with detailed field information
        if (isValidationError(body)) {
          return originalJson.call(this, {
            success: false,
            message: "Validation failed",
            error: "One or more validation errors occurred",
            data: {},
            meta: {
              validationErrors: body.validationErrors,
            },
          });
        }

        // Handle regular errors
        const errorMessage =
          typeof body === "string" ? body : body?.message || "Unknown error";

        return originalJson.call(this, {
          success: false,
          message: "",
          error: errorMessage,
          data: {},
          meta: {},
        });
      }

      // Format success responses
      const response: ApiResponse = {
        success: true,
        message: "",
        error: "",
        data: body,
        meta: {},
      };

      return originalJson.call(this, response);
    };

    // Override send method for non-JSON responses
    res.send = function (body: any): Response {
      if (typeof body === "object" && body !== null && !Buffer.isBuffer(body)) {
        return res.json(body);
      }
      return originalSend.call(this, body);
    };

    next();
  };
}
