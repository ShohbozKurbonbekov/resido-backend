import AgentService from "../models/Agent.service";
import { T } from "../libs/types/common";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Request, Response } from "express";
import { AgentLocation } from "../libs/types/agent";
import { ExtendedRequest } from "../libs/types/user";
import { shapeIntoMongooseObjectId } from "../libs/config";

const agentController: T = {};
const agentService = new AgentService();

//////////////// ------- FIND AGENTS ---------/////////
agentController.getAgentByLocation = async (req: Request, res: Response) => {
  try {
    console.log("getAgentByLocation process");
    const input: AgentLocation = req.body;

    const result = await agentService.getAgentByLocation(input);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getAgentByLocation: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////-----------  GET AGENT DETAIL -----/////////

agentController.getAgentDetail = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("getAgentDetail process");

    const { id } = req.params;
    const member = req.member;
    const agentId = shapeIntoMongooseObjectId(id);
    const result = await agentService.getAgentDetail(agentId, member);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getAgentDetail process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

// LIKE TARGET AGENT

agentController.likeTargetAgent = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("likeTargetAgent process");

    const userId = shapeIntoMongooseObjectId(req.member._id);
    const agentId = shapeIntoMongooseObjectId(req.body.input);

    const result = await agentService.likeTargetAgent(userId, agentId);
    res.status(HttpCode.CREATED).json(result);
  } catch (error) {
    console.log("Error in likeTargetAgent: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};
export default agentController;
