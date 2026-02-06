import express, { NextFunction } from "express";
import uploadFiles from "../middlewares/uploadFile";
import memberController from "../controllers/member.controller";
import { allowRoles } from "../middlewares/allowRoles";
import { Message } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import adminController from "../controllers/admin.controller";
const adminRouter = express.Router();

//////////////////////////////////// ADMIN SIGNUP ////////////////////////////////
adminRouter.post(
  "/signup",
  uploadFiles("members", "avatar", 1, true),
  adminController.processSignup,
);

////////////////////////////////// ADMIN TARIFFS PLAN ///////////////////////
adminRouter.post(
  "/add/tariffs",
  memberController.verifyMember,
  allowRoles(Message.ADMIN_ONLY, MemberType.REAL_ESTATE_ADMIN),
  adminController.addTarrif,
);

////////////////////////////////// FETCH ADMIN  TARIFFS ///////////////////////
adminRouter.get(
  "/get/payment-tariffs",
  memberController.verifyMember,
  allowRoles(Message.ADMIN_ONLY, MemberType.REAL_ESTATE_ADMIN),
  adminController.getAdminTariffs,
);

////////////////////////////////// EDIT TARIFF PLAN ///////////////////////
adminRouter.post(
  "/edit/tariffs/:id",
  memberController.verifyMember,
  allowRoles(Message.ADMIN_ONLY, MemberType.REAL_ESTATE_ADMIN),
  adminController.editTariff,
);

export default adminRouter;
