import { Response } from 'express';

declare global {
  namespace Express {
    interface Response {
      /**
       * Send a success response with formatted data
       */
      success<T>(data: T): Response;
    }
  }
} 