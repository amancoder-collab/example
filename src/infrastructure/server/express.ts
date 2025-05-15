import config from "@/config";
import security from "@/infrastructure/security/security.service";
import swagger from "@/infrastructure/swagger/swagger";
import { errorHandler } from "@/shared/exceptions/error.middleware";
import { responseFormatter } from "@/shared/middleware/response.middleware";
import compression from "compression";
import express, { Application, Request, Response } from "express";
import { Server } from "http";
import morgan from "morgan";
import { logger } from "../logger/logger.service";
import processHandler from "./process-handler";
import authRoutes from "@/modules/auth/routes/auth.routes";

class ExpressServer {
  private app: Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    processHandler.setupProcessHandlers();
  }

  private setupMiddleware(): void {
    const securityMiddleware = security.getMiddleware();

    // Security middleware
    this.app.use(securityMiddleware.helmet);
    this.app.use(securityMiddleware.cors);
    this.app.use("/api", securityMiddleware.rateLimiter);

    // Request logging
    if (config.env === "development") {
      this.app.use(morgan("dev"));
    }

    // Compression
    this.app.use(compression());

    // Body parser
    this.app.use(express.json({ limit: "10kb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10kb" }));

    // Response formatter - must be after body parser and before routes
    this.app.use(responseFormatter());
  }

  private setupRoutes(): void {
    this.app.get("/", (_req: Request, res: Response) => {
      res.status(200).json({ status: "ok", message: "API is running" });
    });
    
    this.app.get("/health", (_req: Request, res: Response) => {
      res.status(200).json({ status: "ok" });
    });

    swagger.setup(this.app);

    // API routes
    this.app.use("/api/auth", authRoutes);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): Server {
    return this.app.listen(config.port, () => {
      logger.info(
        `Server running in ${config.env} mode on port ${config.port}`
      );
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

export default new ExpressServer();
