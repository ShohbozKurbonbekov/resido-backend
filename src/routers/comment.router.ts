import express from "express";
import memberController from "../controllers/member.controller";
import { MemberType } from "../libs/enums/member.enum";
import commentController from "../controllers/Comment.controller";
import { Message } from "../libs/Errors";
import { allowRoles } from "../middlewares/allowRoles";
const comment = express.Router();

/////////////////// -- WRITE COMMENT -- //////////////////
comment.post(
  "/write-comment",
  memberController.verifyMember,
  allowRoles(Message.ALLOW_USER_COMMENT, MemberType.USER),
  commentController.createComment
);

/////////////// --  GET 10 LATEST COMMENTS -- ////////////
comment.get("/get/latest", commentController.getLatestComments);

////////////////// -- GET EVERY 10 PROPERTY COMMMENTS --//////////
comment.post("/get/:id/comments", commentController.getComments);

export default comment;
