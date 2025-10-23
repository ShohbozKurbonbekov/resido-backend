import express from "express";
import memberController from "../controllers/member.controller";
import agentController from "../controllers/Agent.controller";
const agent = express.Router();

////////////////////// ---- AGENT ---------- //////////////
agent.get(
  "/:id",
  memberController.checkMemberAuth,
  agentController.getAgentDetail
);
export default agent;
