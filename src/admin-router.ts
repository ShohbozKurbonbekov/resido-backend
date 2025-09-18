import express from "express";
import residoAdminController from "./controllers/resido-admin.controller";

const adminRouter = express.Router();

// Home
adminRouter.get("/", residoAdminController.goHome);

// Login
adminRouter.get("/login", residoAdminController.getLogin);

// Signup
adminRouter.get("/signup", residoAdminController.getSignup);

export default adminRouter;
