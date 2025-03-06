import winston from 'winston';

// Create a winston logger instance with different log levels
export const logger = winston.createLogger({
  level: 'info', // Set default log level
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ],
});
