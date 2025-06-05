#!/usr/bin/env node
const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Swagger API',
      version: '1.0.0',
      description: 'API documentation for the Swagger lookup',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, 'src/modules/**/routes/*.ts'),
    path.join(__dirname, 'src/modules/**/controllers/*.ts'),
    path.join(__dirname, 'src/modules/**/models/*.ts'),
  ],
};

// Generate swagger specification
const swaggerSpec = swaggerJSDoc(options);

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write swagger.json file
fs.writeFileSync(
  path.join(distDir, 'swagger.json'),
  JSON.stringify(swaggerSpec, null, 2)
);

console.log('✅ Swagger documentation generated successfully!'); 