
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log levels
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

// Set current log level from environment or default to INFO
const currentLogLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Current date for the log file name
const getLogFileName = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}.log`;
};

// Format log message
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level}] ${message} ${metaString}\n`;
};

// Write log to file
const writeToLogFile = (message) => {
  const logFilePath = path.join(logsDir, getLogFileName());
  fs.appendFileSync(logFilePath, message);
};

// Should log check based on level
const shouldLog = (level) => {
  const levels = Object.values(LOG_LEVELS);
  return levels.indexOf(level) <= levels.indexOf(currentLogLevel);
};

// Log method
const log = (level, message, meta = {}) => {
  if (!shouldLog(level)) return;
  
  // Sanitize sensitive information
  const sanitizedMeta = { ...meta };
  if (sanitizedMeta.password) sanitizedMeta.password = '[REDACTED]';
  if (sanitizedMeta.token) sanitizedMeta.token = '[REDACTED]';
  
  const logMessage = formatLogMessage(level, message, sanitizedMeta);
  
  // Write to console in development
  if (process.env.NODE_ENV !== 'production') {
    const consoleMethod = level === LOG_LEVELS.ERROR ? 'error' : 
                         level === LOG_LEVELS.WARN ? 'warn' : 'log';
    console[consoleMethod](logMessage);
  }
  
  // Always write to file
  writeToLogFile(logMessage);
};

// Export log methods
export const logger = {
  error: (message, meta = {}) => log(LOG_LEVELS.ERROR, message, meta),
  warn: (message, meta = {}) => log(LOG_LEVELS.WARN, message, meta),
  info: (message, meta = {}) => log(LOG_LEVELS.INFO, message, meta),
  debug: (message, meta = {}) => log(LOG_LEVELS.DEBUG, message, meta),
  
  // Special method for logging API requests
  request: (req, res, time) => {
    if (!shouldLog(LOG_LEVELS.INFO)) return;
    
    const meta = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      responseTime: time,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      userId: req.user?._id,
      userType: req.user?.userType,
    };
    
    log(LOG_LEVELS.INFO, `API Request`, meta);
  }
};

export default logger;
