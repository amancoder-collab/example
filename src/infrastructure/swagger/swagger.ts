import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";
import config from "@/config";
import path from "path";
import fs from "fs";

// Options for dynamic generation in development
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

// Get Swagger spec - either from pre-generated file or generate dynamically
function getSwaggerSpec(): object {
  // In production, try to use the pre-generated file
  // if (config.env === "production") {
    try {
      // First try to load from the current directory
      const swaggerJsonPath = path.join(process.cwd(), "swagger.json");
      console.log(swaggerJsonPath);
      if (fs.existsSync(swaggerJsonPath)) {
        console.log(`Loading Swagger from ${swaggerJsonPath}`);
        return JSON.parse(fs.readFileSync(swaggerJsonPath, "utf8"));
      }

      
      console.warn("Pre-generated swagger.json not found, generating dynamically");
    } catch (error) {
      console.warn("Error loading swagger.json, falling back to dynamic generation:", error);
    }
  // }
  
  // In development or if file loading fails, generate dynamically
  return swaggerJSDoc(options);
}

const swaggerSpec = getSwaggerSpec();

export default {
  setup(app: Application): void {
    // Serve the static Swagger JSON file
    app.get("/swagger.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    // Swagger API docs at /docs
    app.use(
      "/docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
          url: "/swagger.json", // Use the served JSON instead of the embedded one
          security: [{ bearerAuth: [] }],
        },
      })
    );

    // API JSON documentation endpoint (alternative)
    app.get("/docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });
  },
};
