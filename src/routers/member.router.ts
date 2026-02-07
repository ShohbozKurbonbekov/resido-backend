import express from "express";
import memberController from "../controllers/member.controller";
import { Message } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import commentController from "../controllers/Comment.controller";
import blogController from "../controllers/Blog.controller";
import { allowRoles } from "../middlewares/allowRoles";
import uploadFiles from "../middlewares/uploadFile";
const member = express.Router();

//////////////// --- GET ADMIN -----//////////////////////
member.get("/admin", memberController.getAdmin);

//////////////////// -- SIGNUP --//////////////////////////
member.post("/signup", memberController.getSignup);
export default member;

///////////////////// -- LOGIN -- /////////////////////////
member.post("/login", memberController.login);

/////////////////// -- MEMBER DETAIL -- ///////////////////
member.get(
  "/detail",
  memberController.verifyMember,
  memberController.getMemberDetail,
);

/////////////////// --  MEMBER UPDATE -- ///////////////////
member.post(
  "/update",
  memberController.verifyMember,
  uploadFiles("members", "avatar", 1, true),
  memberController.updateMember,
);

////////////////// -- LOGOUT -- //////////////////
member.post("/logout", memberController.verifyMember, memberController.logout);

//////////////// - GET ALL MEMBER MESSAGES -- ////////////
member.post(
  "/get/all-messages",
  memberController.verifyMember,
  memberController.getMemberMessages,
);

//////////////// - DELETE MEMBER MESSAGE -- ////////////
member.post(
  "/message/:id/delete",
  memberController.verifyMember,
  memberController.messageDelete,
);

//////////////// - EDIT MEMBER MESSAGE -- ////////////
member.post(
  "/message/:id/edit",
  memberController.verifyMember,
  memberController.messageEdit,
);

//////////////// -  WRITE A MESSAGE TO  MEMBER -- ////////////
member.post(
  "/write/message",
  memberController.verifyMember,
  memberController.WriteMessageToMember,
);

//////////////////// - READ MESSAGE - /////////////////
member.post(
  "/message/:id/read",
  memberController.verifyMember,
  memberController.messageRead,
);
/////////////////////// BLOG  ENDPOINTS ////////////////////
member.post(
  "/post/blog",
  memberController.verifyMember,
  allowRoles(
    undefined,
    MemberType.AGENCY,
    MemberType.AGENT,
    MemberType.REAL_ESTATE_ADMIN,
  ),
  uploadFiles("blogs", "blogImage", 1, true),
  blogController.postBlog,
);

///////////////////////////// PUBLIC TARIFF PLANS ///////////////////////
member.get("/public/tariffs", memberController.getPublicTariffs);

///////////////////////////// GET TARIFF  ONE ///////////////////////
member.get(
  "/public/tariffs/:id",
  memberController.verifyMember,
  memberController.getPublicTariffOne,
);

/////////////////////// USER MEMBER DASHBOARD ////////////////////
member.get(
  "/dashboard/overview",
  memberController.verifyMember,
  allowRoles(Message.USER_PAGE, MemberType.USER),
  memberController.userDashboardOverview,
);

///////////////////// USER NOTIFICATIONS ///////////////
member.get(
  "/get/notifications",
  memberController.verifyMember,
  allowRoles(Message.USER_PAGE, MemberType.USER),
  memberController.userNotifications,
);

///////////////////// USER =>  AGENT STATUS ///////////////

///////////////////// APPROVE AGENT REJECTION  ///////////////
member.post(
  "/approve/agent/rejection/:id",
  memberController.verifyMember,
  allowRoles(Message.USER_PAGE, MemberType.USER),
  memberController.approveAgentRejection,
);

////////////////////// GET AGENCY & AGENT  PROPERTIES ///////////////////
member.get(
  "/dashboard/get/all-properties",
  memberController.verifyMember,
  allowRoles(Message.INVALID_ROLE, MemberType.AGENCY, MemberType.AGENT),
  memberController.getAllProperties,
);
