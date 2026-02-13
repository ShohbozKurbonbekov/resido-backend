import express from "express";
import memberController from "../controllers/member.controller";
import blogController from "../controllers/Blog.controller";
import { Message } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import { allowRoles } from "../middlewares/allowRoles";
import uploadFiles from "../middlewares/uploadFile";
const blog = express.Router();

//////////////////// -- GET BLOG DETAIL -- //////////
blog.get(
  "/:id",
  memberController.checkMemberAuth,
  blogController.getBlogDetail,
);

/////////////////////// UPDATE BLOGS ////////////////////
blog.post(
  "/update/myBlog/:id",
  memberController.verifyMember,
  allowRoles(
    Message.ONLY_AGENCY_ADMIN_AGENT,
    MemberType.AGENCY,
    MemberType.AGENT,
    MemberType.REAL_ESTATE_ADMIN,
  ),
  uploadFiles("blogs", "blogImage", 1, true),
  blogController.updateMyBlog,
);

//////////////////////// -- GETBLOGS -- /////////////////

blog.post(
  "/get/all",
  memberController.checkMemberAuth,
  blogController.getAllBlogs,
);

///////////////// -- LIKE TARGET BLOG -- ///////////////
blog.post(
  "/liked",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS, MemberType.USER),
  blogController.likeTargetBlog,
);

///////////////////// --- SAVE A SPECIFIC BLOG --////////////
blog.get(
  "/:id/toggle-save",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS_SAVE, MemberType.USER),
  blogController.saveToggleBlog,
);

//////////////////// -- GET SAVED PROPERTIES --- ///////////////
blog.post(
  "/see/saved-blogs",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS_SAVE_SEE, MemberType.USER),
  blogController.getSavedBlogs,
);

/////////////// --GET BLOGS BY TAG -- //////////////////
blog.get("/tags/related", blogController.blogSearchTag);

export default blog;
