/**
 * Logger Service
 *
 * Centralized logging service to handle all application logs.
 * Supports different log levels and formatting.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class LoggerService {
  private static instance: LoggerService;
  private currentLogLevel: LogLevel = LogLevel.INFO; // Default log level

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  /**
   * Set the minimum log level
   */
  public setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
  }

  /**
   * Get the current log level
   */
  public getLogLevel(): string {
    return LogLevel[this.currentLogLevel];
  }

  /**
   * Format the log message with timestamp and additional info
   */
  private formatLog(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  /**
   * Log a debug message
   */
  public debug(message: string, data?: any): void {
    if (this.currentLogLevel <= LogLevel.DEBUG) {
      console.log(this.formatLog('DEBUG', message, data));
    }
  }

  /**
   * Log an info message
   */
  public info(message: string, data?: any): void {
    if (this.currentLogLevel <= LogLevel.INFO) {
      console.log(this.formatLog('INFO', message, data));
    }
  }

  /**
   * Log a warning message
   */
  public warn(message: string, data?: any): void {
    if (this.currentLogLevel <= LogLevel.WARN) {
      console.warn(this.formatLog('WARN', message, data));
    }
  }

  /**
   * Log an error message
   */
  public error(message: string, error?: any): void {
    if (this.currentLogLevel <= LogLevel.ERROR) {
      console.error(this.formatLog('ERROR', message, error));

      // If it's an Error object, we can log the stack trace
      if (error instanceof Error) {
        console.error(error.stack);
      }
    }
  }

  /**
   * Create a child logger that prefixes messages with a context
   */
  public createChild(context: string): ChildLogger {
    return new ChildLogger(this, context);
  }
}

/**
 * Child logger that prefixes all logs with a context
 */
export class ChildLogger {
  private parentLogger: LoggerService;
  private context: string;

  constructor(parentLogger: LoggerService, context: string) {
    this.parentLogger = parentLogger;
    this.context = context;
  }

  public debug(message: string, data?: any): void {
    this.parentLogger.debug(`[${this.context}] ${message}`, data);
  }

  public info(message: string, data?: any): void {
    this.parentLogger.info(`[${this.context}] ${message}`, data);
  }

  public warn(message: string, data?: any): void {
    this.parentLogger.warn(`[${this.context}] ${message}`, data);
  }

  public error(message: string, error?: any): void {
    this.parentLogger.error(`[${this.context}] ${message}`, error);
  }
}
