import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import config from '@/config';
import path from 'path';

const options: swaggerJSDoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Video Game Certification API',
      version: '1.0.0',
      description: 'API documentation for the Video Game Certification lookup',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
  },
  apis: [
    path.join(__dirname, '../../modules/**/routes/*.ts'),
    path.join(__dirname, '../../modules/**/controllers/*.ts')
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default {
  setup(app: Application): void {
    // Swagger API docs at /docs
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        security: [{ bearerAuth: [] }],
      },
    }));

    // API JSON documentation endpoint
    app.get('/docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  },
}; 