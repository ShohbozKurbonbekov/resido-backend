import express from "express";
import residoAdminController from "./controllers/resido-admin.controller";
import memberController from "./controllers/member.controller";

const adminRouter = express.Router();

// Home
adminRouter.get("/", residoAdminController.goHome);

adminRouter.get("/dashboard", residoAdminController.getDashboard);
// Login
adminRouter.get("/login", residoAdminController.getLogin);

// Signup
adminRouter.get("/signup", residoAdminController.getSignup);

adminRouter.post(
  "/signup",
  residoAdminController.uploadMemberImage,
  residoAdminController.processSignup
);

export default adminRouter;
