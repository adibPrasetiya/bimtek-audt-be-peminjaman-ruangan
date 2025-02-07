import express from "express";
import cors from "cors";
import { corsOptions } from "../config/cors-config.js";
import bodyParser from "body-parser";
import { publicRoutes } from "../routes/public-routes.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { authenticationMiddleware } from "../middleware/authentication-middleware.js";
import { protectedRoutes } from "../routes/protected-routes.js";
import { responseInterceptor } from "../middleware/interceptor-middleware.js";

export const app = express();

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(responseInterceptor);

app.use(publicRoutes);
app.use(authenticationMiddleware);
app.use(protectedRoutes);

app.use(errorMiddleware);
