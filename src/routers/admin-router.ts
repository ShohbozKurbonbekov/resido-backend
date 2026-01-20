import express from "express";
import residoAdminController from "../controllers/resido-admin.controller";
import uploadFiles from "../middlewares/uploadFile";
import memberController from "../controllers/member.controller";
import { allowRoles } from "../middlewares/allowRoles";
import { Message } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
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
  residoAdminController.processSignup,
);

//////////////////////////////////// ADMIN TARIFFS PLAN ///////////////////////
adminRouter.post(
  "/tariffs",
  memberController.verifyMember,
  allowRoles(Message.ADMIN_ONLY, MemberType.REAL_ESTATE_ADMIN),
  residoAdminController.addTarrif,
);

export default adminRouter;
