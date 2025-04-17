import { Router } from "express";
import { z } from "zod";
import { validate, ValidatorOptions } from "../validators/global.validator";
import { createRouteDocumentation } from "./index";

interface RouteConfig {
  path: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  schema?: z.ZodTypeAny;
  validationOptions?: ValidatorOptions;
  summary: string;
  description?: string;
  tags?: string[];
  requiresAuth?: boolean;
  responses?: Record<string, { description: string; content?: any }>;
  middlewares?: any[];
  controller: (req: any, res: any, next?: any) => any;
}

/**
 * A decorator function to add routes with automatic documentation
 */
export function createRoute(router: Router, config: RouteConfig): void {
  const {
    path,
    method,
    schema,
    validationOptions,
    summary,
    description,
    tags,
    requiresAuth,
    responses,
    middlewares = [],
    controller,
  } = config;

  // Generate Swagger documentation
  const swaggerDocs = createRouteDocumentation({
    path,
    method,
    schema,
    schemaType:
      validationOptions?.source === "all" ? "body" : validationOptions?.source,
    summary,
    description,
    tags,
    requiresAuth,
    responses,
  });

  // Add the route with documentation
  const route = (router as any)[method].bind(router);

  // Build up the middleware stack
  const stack = [];

  // Add authentication middleware if required
  if (requiresAuth && !middlewares.some((m) => m.name === "authenticate")) {
    // This assumes you have an authentication middleware
    // You might need to import it here or pass it as a parameter
    try {
      const {
        authenticate,
      } = require("../../modules/auth/middlewares/auth.middleware");
      stack.push(authenticate);
    } catch (e) {
      console.warn(
        "Authentication middleware not found but requiresAuth is true"
      );
    }
  }

  // Add validation middleware if schema is provided
  if (schema) {
    stack.push(validate(schema, validationOptions));
  }

  // Add other middlewares
  stack.push(...middlewares);

  // Add controller
  stack.push(controller);

  // Apply Swagger documentation (as a comment in the code)
  eval(swaggerDocs);

  // Register the route
  route(path, ...stack);
}

/**
 * Create documented routes with a more fluent API
 */
export function documentedRouter(baseRouter: Router) {
  return {
    get: (
      path: string,
      controller: any,
      options: Omit<RouteConfig, "path" | "method" | "controller">
    ) =>
      createRoute(baseRouter, { path, method: "get", controller, ...options }),

    post: (
      path: string,
      controller: any,
      options: Omit<RouteConfig, "path" | "method" | "controller">
    ) =>
      createRoute(baseRouter, { path, method: "post", controller, ...options }),

    put: (
      path: string,
      controller: any,
      options: Omit<RouteConfig, "path" | "method" | "controller">
    ) =>
      createRoute(baseRouter, { path, method: "put", controller, ...options }),

    delete: (
      path: string,
      controller: any,
      options: Omit<RouteConfig, "path" | "method" | "controller">
    ) =>
      createRoute(baseRouter, {
        path,
        method: "delete",
        controller,
        ...options,
      }),

    patch: (
      path: string,
      controller: any,
      options: Omit<RouteConfig, "path" | "method" | "controller">
    ) =>
      createRoute(baseRouter, {
        path,
        method: "patch",
        controller,
        ...options,
      }),

    router: baseRouter,
  };
}
