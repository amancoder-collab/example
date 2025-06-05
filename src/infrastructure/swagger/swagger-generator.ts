import swaggerJSDoc from "swagger-jsdoc";
import config from "@/config";
import path from "path";
import fs from "fs";

// Same options as in swagger.ts
const options: swaggerJSDoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Swagger API",
      version: "1.0.0",
      description: "API documentation for the Swagger lookup",
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Development server",
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
  apis: [
    path.join(__dirname, "../../modules/**/routes/*.ts"),
    path.join(__dirname, "../../modules/**/controllers/*.ts"),
    path.join(__dirname, "../../modules/**/models/*.ts"),
  ],
};

// Generate the Swagger specification
const swaggerSpec = swaggerJSDoc(options);

// Function to generate and save the Swagger JSON
export function generateSwaggerJson(outputPath: string = "swagger.json"): void {
  try {
    fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
    console.log(`✅ Swagger JSON generated at ${outputPath}`);
  } catch (error) {
    console.error("❌ Failed to generate Swagger JSON:", error);
  }
}

// Execute if this file is run directly
if (require.main === module) {
  generateSwaggerJson();
} 