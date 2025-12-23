import express from "express";
import memberController from "../controllers/member.controller";
import agentController from "../controllers/Agent.controller";
import { Message } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import { allowRoles } from "../middlewares/allowRoles";
import uploadAgent from "../libs/utils/agentUploader";
import multerErrorHandler from "../middlewares/errorHandler";
const agent = express.Router();

////////////////////// ---- AGENT DETAIL ---------- //////////////
agent.get(
  "/:id",
  memberController.checkMemberAuth,
  agentController.getAgentDetail
);

//////////////////// ---------- AGENT PROPERTIES ---- ////////////////
agent.post("/:id/properties", agentController.getAgentProperties);

////////////////// -- GET FEATURED AGENTS -- ////////////////

agent.post("/featured-agents", agentController.getFeaturedAgents);

////////////////// ---- SEARCH AGENT ---------- /////////////
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
export default agent;
