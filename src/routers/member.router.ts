import express from "express";
import memberController from "../controllers/member.controller";
import { Message } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import { allowRoles } from "../libs/config";
import commentController from "../controllers/Comment.controller";
const member = express.Router();

//////////////////// -- SIGNUP --//////////////////////////
member.post("/signup", memberController.getSignup);
export default member;

///////////////////// -- LOGIN -- /////////////////////////
member.post("/login", memberController.login);

/////////////////// -- MEMBER DETAIL -- ///////////////////
member.get(
  "/detail",
  memberController.verifyMember,
  memberController.getMemberDetail
);

/////////////////// --  MEMBER UPDATE -- ///////////////////
member.post(
  "/update",
  memberController.verifyMember,
  memberController.uploadMemberImage,
  memberController.updateMember
);

////////////////// -- LOGOUT -- //////////////////
member.post("/logout", memberController.verifyMember, memberController.logout);

//////////////// -  WRITE A MESSAGE TO MEMBER -- ////////////
member.post(
  "/write/message",
  memberController.verifyMember,
  memberController.WriteMessageToMember
);
