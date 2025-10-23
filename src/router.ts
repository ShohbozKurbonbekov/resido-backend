import express from "express";
import memberController from "./controllers/member.controller";
import propertyController from "./controllers/Property.controller";
import commentController from "./controllers/Comment.controller";
import agentController from "./controllers/Agent.controller";
import agencyController from "./controllers/Agency.controller";
import blogController from "./controllers/Blog.controller";
import { allowRoles } from "./libs/config";
import { MemberType } from "./libs/enums/member.enum";
import { Message } from "./libs/Errors";

const router = express.Router();

router.post("/member/featured-agents", memberController.getFeaturedAgents);

////////////////////// ---- AGENT ---------- //////////////
router.post("/member/search/agent", agentController.getAgentByLocation);

////////////////// LIKE TARGET AGENT /////////////////
router.post(
  "/agent/liked",
  memberController.checkMemberAuth,
  memberController.allowOnlyUsers,
  agentController.likeTargetAgent
);

///////////////// GET AGENCY BY LOCATION ///////////////
router.post("/agency/search/location", agencyController.getAgencyByLocation);

router.get(
  "/agency/:id",
  memberController.checkMemberAuth,
  agencyController.getAgencyDetail
);

/////////////////////// BLOG  ENDPOINTS ////////////////////
router.post(
  "/author/post/blog",
  memberController.verifyMember,
  allowRoles(
    undefined,
    MemberType.AGENCY,
    MemberType.AGENT,
    MemberType.REAL_ESTATE_ADMIN
  ),
  blogController.postBlog
);

router.post("/get/all/blogs", blogController.getAllBlogs);
router.post(
  "/blog/liked",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS, MemberType.USER),
  blogController.likeTargetBlog
);

router.get(
  "/blog/:id",
  memberController.checkMemberAuth,
  blogController.getBlogDetail
);
router.get("/blog/:id/neighbour", blogController.getNeighbouringBlog);

router.get("/blog/tags/:tag/blogs", blogController.blogSearchTag);
export default router;
