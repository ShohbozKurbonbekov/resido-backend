import AgentService from "../models/Agent.service";
import { T } from "../libs/types/common";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Request, Response } from "express";
import {
  AgentPropertiesInput,
  FeaturedAgentsInput,
  FeaturedAgentsResult,
  SearchByLocationInput,
} from "../libs/types/agent";
import { ExtendedRequest } from "../libs/types/user";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { ObjectId } from "mongoose";
import { AgentPropertyType } from "../libs/enums/agent.enum";

const agentController: T = {};
const agentService = new AgentService();

//////////////// ------- FIND AGENTS ---------/////////
agentController.getAgentByLocation = async (req: Request, res: Response) => {
  try {
    console.log("getAgentByLocation process");
    const input: SearchByLocationInput = req.body;

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
    const agentId: ObjectId = shapeIntoMongooseObjectId(id);
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

////////////////// ------------ GET FEATURED AGENTS ----------////////////////
agentController.getFeaturedAgents = async (req: Request, res: Response) => {
  try {
    console.log("getFeaturedAgents process");
    const input: FeaturedAgentsInput = req.body;

    const result: FeaturedAgentsResult = await agentService.getFeaturedAgents(
      input
    );
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getFeaturedAgents process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////// ------------- GET AGENT PROPERTIES -----------/////////////////
agentController.getAgentProperties = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page, limit, agentPropertyType, searchLocation } = req.body;
    const inqueries: AgentPropertiesInput = {
      page: Number(page),
      limit: Number(limit),
    };

    if (agentPropertyType !== AgentPropertyType.NONE) {
      inqueries.agentPropertyType = agentPropertyType;
    }
    if (searchLocation) {
      inqueries.searchLocation = searchLocation;
    }

    const agentId = shapeIntoMongooseObjectId(id);
    const result = await agentService.getAgentProperties(agentId, inqueries);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getAgentProperties process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

export default agentController;
