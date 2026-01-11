import express from "express";
import memberController from "../controllers/member.controller";
import agentController from "../controllers/Agent.controller";
import { Message } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import { allowRoles } from "../middlewares/allowRoles";
import uploadAgent from "../libs/utils/agentUploader";
import multerErrorHandler from "../middlewares/errorHandler";
import uploadFiles from "../middlewares/uploadFile";
const agent = express.Router();

////////////////////// ---- AGENT DETAIL ---------- //////////////
agent.get(
  "/:id",
  memberController.checkMemberAuth,
  agentController.getAgentDetail
);

//////////////////// ---------- AGENT PROPERTIES ---- ////////////////
agent.post("/:id/properties", agentController.getAgentProperties);

///////////////// -------------- AGENT PROPERTIES FOR THEIR DASHBOARD---------///////////////
agent.get(
  "/get/all-properties",
  memberController.verifyMember,
  allowRoles(Message.ONLY_AGENTS, MemberType.AGENT),
  agentController.getMyProperties
);

////////////////// -- GET FEATURED AGENTS -- ////////////////

agent.post("/featured-agents", agentController.getFeaturedAgents);

////////////////// ----     SEARCH AGENT ---------- /////////////
agent.post("/search/byLocation", agentController.getAgentByLocation);

////////////////// LIKE TARGET AGENT /////////////////
agent.post(
  "/liked",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS, MemberType.USER),
  agentController.likeTargetAgent
);

///////////////////// --- SAVE A SPECIFIC BLOG --////////////
agent.get(
  "/:id/toggle-save",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS_FOLLOW, MemberType.USER),
  agentController.saveToggleAgent
);

//////////////////// -- GET FOLLOWED AGENTS --- ///////////////
agent.post(
  "/see/followed-agents",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS_FOLLOW, MemberType.USER),
  agentController.getFollowedAgents
);

////////////////// -- AGENT APPLY --- ///////////////
agent.post(
  "/apply/become-agent",
  memberController.verifyMember,
  uploadAgent("agents").fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "certificate",
      maxCount: 1,
    },
  ]),
  multerErrorHandler,
  agentController.agentApply
);

////////////////// -- AGENT UPDATE --- ///////////////
agent.post(
  "/update/agent-profile",
  memberController.verifyMember,
  uploadAgent("agents").fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "certificate",
      maxCount: 1,
    },
  ]),
  multerErrorHandler,
  agentController.updateAgentProfile
);

//////////////////// -- MY BLOGS --- ///////////////
agent.post(
  "/get/myBlogs",
  memberController.verifyMember,
  agentController.myBlogs
);

/////////////////////// UPDATE BLOGS ////////////////////
agent.post(
  "/update/myBlog/:id",
  memberController.verifyMember,
  uploadFiles("blogs", "blogImage", 1, true),
  agentController.agentUpdateMyBlog
);

/////////////////////// DELETE BLOGS ////////////////////
agent.post(
  "/delete/myBlog/:id",
  memberController.verifyMember,
  agentController.deleteMyBlog
);

/////////////////////////  AGENT REVIEWS /////////////////////////
agent.post(
  "/get/my-reviews",
  memberController.verifyMember,
  allowRoles(Message.ONLY_AGENTS, MemberType.AGENT),
  agentController.getMyReviews
);

//////////////////////////// DELETE AGENT PROPERTY FROM DASHBOARD ///////////////////////////

agent.post(
  "/my-properties/archive/:id",
  memberController.verifyMember,
  allowRoles(Message.ONLY_AGENTS, MemberType.AGENT),
  agentController.archiveMyProperty
);

//////////////////////////// UPDATE PUBLISHER PROPERTY FROM DASHBOARD ///////////////////////////

agent.post(
  "/update/my-property/:id",
  memberController.verifyMember,
  allowRoles(Message.ONLY_AGENTS, MemberType.AGENT),
  uploadFiles("properties", "images", 5, true, true, "videos", 1),
  agentController.updatePublisherProperty
);

/////////////////////////////////// AGENT DASHBOARD OVERVIEW ////////////////////////////
agent.get(
  "/dashboard/overview",
  memberController.verifyMember,
  allowRoles(Message.ONLY_AGENTS, MemberType.AGENT),
  agentController.agentDashboardOverview
);
export default agent;
