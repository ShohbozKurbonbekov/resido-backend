import express from "express";
import memberController from "../controllers/member.controller";
import agentController from "../controllers/Agent.controller";
import { Message } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import { allowRoles } from "../middlewares/allowRoles";
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
  "/:id/save",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS_SAVE, MemberType.USER),
  agentController.saveTargetAgent
);

//////////////////// -- GET FOLLOWED AGENTS --- ///////////////
agent.post(
  "/see/followed-agents",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS_FOLLOW, MemberType.USER),
  agentController.getFollowedAgents
);

export default agent;
