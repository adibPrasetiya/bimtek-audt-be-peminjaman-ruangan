import { httpLogger } from "../app/logger.js";
import formatHTTPLoggerResponse from "../utils/http-formator.js";

export const responseInterceptor = (req, res, next) => {
  const originalSend = res.send;

  let responseSent = false;

  res.send = (body) => {
    if (!responseSent) {
      if (res.statusCode < 400) {
        httpLogger.info(body.message, formatHTTPLoggerResponse(req, res, body));
      } else {
        httpLogger.error(
          body.message,
          formatHTTPLoggerResponse(req, res, body)
        );
      }

      responseSent = true;
    }

    return originalSend.call(res, body);
  };

  next();
};
