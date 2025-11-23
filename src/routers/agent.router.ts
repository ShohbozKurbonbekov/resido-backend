import express from "express";
import memberController from "../controllers/member.controller";
import agentController from "../controllers/Agent.controller";
import { allowRoles } from "../libs/config";
import { Message } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
const agent = express.Router();

////////////////////// ---- AGENT DETAIL ---------- //////////////
agent.get(
  "/:id",
  memberController.checkMemberAuth,
  agentController.getAgentDetail
);
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

export default agent;
