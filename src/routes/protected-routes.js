import { Router } from "express";
import userController from "../controller/user-controller.js";
import roomController from "../controller/room-controller.js";
import authorizationMiddleware from "../middleware/authorization-middleware.js";

export const protectedRoutes = new Router();

protectedRoutes.get(
  "/api/v1/user",
  authorizationMiddleware.verifyAuthorization(["Admin"]),
  userController.search
);
protectedRoutes.patch(
  "/api/v1/user/:userId",
  authorizationMiddleware.verifyAuthorization(["Admin"]),
  userController.update
);
protectedRoutes.get("/api/v1/room", roomController.getMyPengajuans);
protectedRoutes.post("/api/v1/room", roomController.pengajuan);
protectedRoutes.get(
  "/api/v1/room/search",
  authorizationMiddleware.verifyAuthorization(["Admin"]),
  roomController.search
);
protectedRoutes.delete("/api/v1/room/:peminjamanId", roomController.remove);
protectedRoutes.patch(
  "/api/v1/room/:peminjamanId",
  authorizationMiddleware.verifyAuthorization(["Admin"]),
  roomController.givePermission
);
