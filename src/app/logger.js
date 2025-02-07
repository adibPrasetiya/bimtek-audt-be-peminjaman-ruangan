import winston from "winston";
import { v4 as uuid } from "uuid";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, json, printf } = winston.format;
const timestampFormat = "MMM-DD-YYYY HH:mm:ss";

const appVersion = process.env.npm_package_version;
const generateLogId = uuid();

// logger format
const formatLogger = combine(
  timestamp({ format: timestampFormat }),
  json(),
  printf(({ timestamp, level, message, ...data }) => {
    const response = {
      level,
      logId: generateLogId,
      timestamp,
      appInfo: {
        appVersion,
        environtment: process.env.NODE_ENV,
        proccessId: process.pid,
      },
      message,
      data,
    };

    return JSON.stringify(response, null, 2);
  })
);

// logger for API endpoint
const httpLogger = winston.createLogger({
  format: formatLogger,
  transports: [
    new DailyRotateFile({
      filename: "logs/rotating-logs-%DATE%.log",
      datePattern: "YYYY-MMMM-DD",
      zippedArchive: false,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

export { httpLogger };
