import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { z } from "zod";
import { zodToOpenApi } from "../validators/global.validator";

interface RouteDefinition {
  path: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  schema?: z.ZodTypeAny;
  schemaType?: "body" | "params" | "query";
  summary: string;
  description?: string;
  tags?: string[];
  requiresAuth?: boolean;
  responses?: Record<string, { description: string; content?: any }>;
}

/**
 * Creates automatic Swagger documentation for a route based on its Zod schema
 */
export function createRouteDocumentation(routeDef: RouteDefinition): string {
  const {
    path,
    method,
    schema,
    schemaType,
    summary,
    description,
    tags,
    requiresAuth,
    responses,
  } = routeDef;

  let swaggerDoc = `
/**
 * @swagger
 * ${path}:
 *   ${method}:
 *     summary: ${summary}
 *     ${description ? `description: ${description}` : ""}
 *     ${
   tags && tags.length ? `tags:\n *       - ${tags.join("\n *       - ")}` : ""
 }
 *     ${requiresAuth ? `security:\n *       - bearerAuth: []` : ""}`;

  // Add request body documentation if schema exists and type is body
  if (schema && (!schemaType || schemaType === "body")) {
    const openApiSchema = zodToOpenApi(schema);
    swaggerDoc += `
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             ${formatOpenApiSchema(openApiSchema, 13)}`;
  }

  // Add parameters documentation if schema exists and type is params or query
  if (schema && (schemaType === "params" || schemaType === "query")) {
    const openApiSchema = zodToOpenApi(schema);
    const shape = (schema as any)._def.shape();

    swaggerDoc += `
 *     parameters:`;

    for (const key in shape) {
      const paramSchema = zodToOpenApi(shape[key]);
      swaggerDoc += `
 *       - in: ${schemaType}
 *         name: ${key}
 *         required: ${!shape[key]._def.typeName.includes("Optional")}
 *         schema:
 *           ${formatOpenApiSchema(paramSchema, 11)}`;
    }
  }

  // Add response documentation
  swaggerDoc += `
 *     responses:`;

  // Add default success response if none provided
  if (!responses || Object.keys(responses).length === 0) {
    swaggerDoc += `
 *       200:
 *         description: Successful operation`;
  } else {
    for (const [code, response] of Object.entries(responses)) {
      swaggerDoc += `
 *       ${code}:
 *         description: ${response.description}`;

      if (response.content) {
        swaggerDoc += `
 *         content:
 *           application/json:
 *             schema:
 *               ${formatOpenApiSchema(response.content, 15)}`;
      }
    }
  }

  swaggerDoc += `
 */`;

  return swaggerDoc;
}

/**
 * Helper function to format OpenAPI schema with proper indentation
 */
function formatOpenApiSchema(schema: any, indentLevel: number): string {
  if (typeof schema !== "object") return String(schema);

  const indent = " ".repeat(indentLevel);
  let result = "";

  if (schema.type === "object" && schema.properties) {
    result += `type: object\n${indent}`;

    if (schema.required && schema.required.length) {
      result += `required:\n${indent}  - ${schema.required.join(
        `\n${indent}  - `
      )}\n${indent}`;
    }

    result += `properties:`;

    for (const [key, prop] of Object.entries(schema.properties)) {
      result += `\n${indent}  ${key}:\n${indent}    ${formatOpenApiSchema(
        prop,
        indentLevel + 4
      ).replace(/\n\s+/g, `\n${indent}    `)}`;
    }
  } else if (schema.type === "array" && schema.items) {
    result += `type: array\n${indent}items:\n${indent}  ${formatOpenApiSchema(
      schema.items,
      indentLevel + 2
    ).replace(/\n\s+/g, `\n${indent}  `)}`;
  } else {
    result += `type: ${schema.type}`;

    if (schema.format) {
      result += `\n${indent}format: ${schema.format}`;
    }

    if (schema.enum) {
      result += `\n${indent}enum: [${schema.enum.join(", ")}]`;
    }

    if (schema.minimum !== undefined) {
      result += `\n${indent}minimum: ${schema.minimum}`;
    }

    if (schema.maximum !== undefined) {
      result += `\n${indent}maximum: ${schema.maximum}`;
    }

    if (schema.minLength !== undefined) {
      result += `\n${indent}minLength: ${schema.minLength}`;
    }

    if (schema.maxLength !== undefined) {
      result += `\n${indent}maxLength: ${schema.maxLength}`;
    }

    if (schema.pattern) {
      result += `\n${indent}pattern: ${schema.pattern}`;
    }
  }

  return result;
}

/**
 * Sets up Swagger documentation for the API
 */
export function setupSwagger(app: Router): void {
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Video Games ID API",
        version: "1.0.0",
        description: "API documentation for Video Games ID",
      },
      servers: [
        {
          url: "/api",
          description: "API Server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    apis: ["./src/modules/**/routes/*.ts"],
  };

  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
