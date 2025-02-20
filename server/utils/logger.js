const {createLogger, format, transports} = require("winston");
const path = require("path");

//Define log file locations
const logFilePath = path.join(__dirname, "../logs/app.log");
const errorLogFilePath = path.join(__dirname, "../logs/error.log");

const logger = createLogger({
  level: "info", 
  format: format.combine(
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'},
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)),
    format.json()
  ),
  transports: [
    new transports.Console(), // Logs to console
    new transports.File({ filename: logFilePath }), // Logs general info
    new transports.File({ filename: errorLogFilePath, level: "error" }) // Logs only errors
  ]
});

//Middleware function for Express
const logRequests = (req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
};

module.exports = { logger, logRequests };