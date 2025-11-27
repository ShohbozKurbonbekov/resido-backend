import express from "express";
import memberController from "../controllers/member.controller";
import blogController from "../controllers/Blog.controller";
import { Message } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import { allowRoles } from "../middlewares/allowRoles";
const blog = express.Router();

//////////////////// -- GET BLOG DETAIL -- //////////
blog.get(
  "/:id",
  memberController.checkMemberAuth,
  blogController.getBlogDetail
);

//////////////////////// -- GETBLOGS -- /////////////////

blog.post(
  "/get/all",
  memberController.checkMemberAuth,
  blogController.getAllBlogs
);

///////////////// -- LIKE TARGET BLOG -- ///////////////
blog.post(
  "/liked",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS, MemberType.USER),
  blogController.likeTargetBlog
);

///////////////////--  GET NEIGHBOURING BLOG -- /////////////
blog.get("/:id/neighbour", blogController.getNeighbouringBlog);

/////////////// --GET BLOGS BY TAG -- //////////////////
blog.get("/tags/:tag", blogController.blogSearchTag);

export default blog;
