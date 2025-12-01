import express from "express";
import residoAdminController from "../controllers/resido-admin.controller";
import uploadFiles from "../middlewares/uploadFile";
const adminRouter = express.Router();

// Home
adminRouter.get("/", residoAdminController.goHome);

adminRouter.get("/dashboard", residoAdminController.getDashboard);
// Login
adminRouter.get("/login", residoAdminController.getLogin);
adminRouter.post("/login", residoAdminController.processLogin);
// Signup
adminRouter.get("/signup", residoAdminController.getSignup);

adminRouter.post(
  "/signup",
  uploadFiles("members", "avatar", 1, true),
  residoAdminController.processSignup
);

export default adminRouter;
