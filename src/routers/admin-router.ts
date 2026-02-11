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

////////////////////////////////// EDIT TARIFF PLAN ///////////////////////
adminRouter.post(
  "/change/tariffs/status",
  memberController.verifyMember,
  allowRoles(Message.ADMIN_ONLY, MemberType.REAL_ESTATE_ADMIN),
  adminController.adminChangeTariffStatus,
);

///////////////////////////////// GET COMMENTS  FOR ADDMIN /////////////////////////
adminRouter.get(
  "/comments/getCommentsForAdmin",
  memberController.verifyMember,
  allowRoles(Message.ADMIN_ONLY, MemberType.REAL_ESTATE_ADMIN),
  adminController.getCommentsForAdmin,
);
export default adminRouter;

////////////////////////////// ADMIN CHANGE COMMENT STATUS ///////////////////////////
adminRouter.post(
  "/comments/status/change/:id",
  memberController.verifyMember,
  allowRoles(Message.ACCESS_DENIED, MemberType.REAL_ESTATE_ADMIN),
  adminController.adminChangeCommentStatus,
);

////////////////////////////// ADMIN GET ALL BLOGS ///////////////////////////
adminRouter.post(
  "/blogs/get-all",
  memberController.verifyMember,
  allowRoles(Message.ACCESS_DENIED, MemberType.REAL_ESTATE_ADMIN),
  adminController.getBlogsByAdmin,
);

////////////////////////////// ADMIN CHANGE BLOG STATUS ///////////////////////////
adminRouter.post(
  "/change/blogs/status/:id",
  memberController.verifyMember,
  allowRoles(Message.ACCESS_DENIED, MemberType.REAL_ESTATE_ADMIN),
  adminController.adminChangeBlogsStatus,
);

////////////////////////////// ADMIN GET ALL MEMBERS ///////////////////////////
adminRouter.post(
  "/get/all/members",
  memberController.verifyMember,
  allowRoles(Message.ACCESS_DENIED, MemberType.REAL_ESTATE_ADMIN),
  adminController.adminGetAllMembers,
);

////////////////////////////// ADMIN CHANGE MEMBER STATUS ///////////////////////////
adminRouter.post(
  "/change/member/status/:id",
  memberController.verifyMember,
  allowRoles(Message.ACCESS_DENIED, MemberType.REAL_ESTATE_ADMIN),
  adminController.adminChangeMemberStatus,
);
