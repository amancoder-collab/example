import winston, { Logger, format } from "winston";
import config from "@/config";
import { BaseService } from "@/shared/utils/base.service";

interface LogMeta {
  [key: string]: unknown;
  context?: string;
}

const nestLikeConsoleFormat = format.printf((info) => {
  const context = (info.context as string) || "App";
  delete info.context;

  const upperLevel = info.level.toUpperCase();

  const formattedTimestamp = new Date(info.timestamp as string).toISOString();

  const timestamp = `\x1b[32m[${formattedTimestamp}]\x1b[0m`; // Green
  const level =
    info.level === "error"
      ? `\x1b[31m[${upperLevel}]\x1b[0m` // Red for error
      : info.level === "warn"
      ? `\x1b[33m[${upperLevel}]\x1b[0m` // Yellow for warn
      : info.level === "debug"
      ? `\x1b[34m[${upperLevel}]\x1b[0m` // Blue for debug
      : `\x1b[32m[${upperLevel}]\x1b[0m`; // Green for info
  const contextBrackets = `\x1b[32m[${context}]\x1b[0m`; // Green

  let output = `${timestamp} ${level} ${contextBrackets} ${info.message}`;

  const {
    level: _level,
    message: _message,
    timestamp: _timestamp,
    ...metadata
  } = info;
  const remainingMeta =
    Object.keys(metadata).length > 0 ? JSON.stringify(metadata, null, 2) : "";
  if (remainingMeta) {
    output += ` - ${remainingMeta}`;
  }

  return output;
});

class LoggerService extends BaseService {
  private logger!: Logger;

  constructor() {
    super();
    if (this.logger) return this;

    this.logger = winston.createLogger({
      level: config.logger.level,
      format: format.combine(format.timestamp(), format.json()),
      transports: [
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: "logs/combined.log",
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });

    if (config.env !== "production") {
      this.logger.add(
        new winston.transports.Console({
          format: format.combine(format.timestamp(), nestLikeConsoleFormat),
        })
      );
    }
  }

  public info(message: string, meta: LogMeta = {}): void {
    this.logger.info(message, meta);
  }

  public error(message: string, meta: LogMeta = {}): void {
    this.logger.error(message, meta);
  }

  public warn(message: string, meta: LogMeta = {}): void {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta: LogMeta = {}): void {
    this.logger.debug(message, meta);
  }
}

export const logger = LoggerService.getInstance<LoggerService>();
