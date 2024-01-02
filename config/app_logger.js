const winston = require('winston');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create a logger instance
const logger = winston.createLogger({
  level: 'info', // You can adjust the logging level as needed
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: 'eas1_app_backend.log' }) // Log to a file named 'eas1_app_backend.log'
  ]
});

// Log unhandled exceptions
logger.exceptions.handle(new winston.transports.File({ filename: 'eas1_app_backend_exceptions.log' }));

module.exports = logger;
