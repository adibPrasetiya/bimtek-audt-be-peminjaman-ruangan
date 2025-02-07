import { Router } from "express";
import userController from "../controller/user-controller.js";

export const publicRoutes = new Router();

publicRoutes.post("/api/v1/user", userController.registration);
publicRoutes.get("/api/v1/user/logout", userController.logout);
publicRoutes.post("/api/v1/user/login", userController.login);
