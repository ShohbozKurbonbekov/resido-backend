import AgentService from "../models/Agent.service";
import { CommonPageInput, T } from "../libs/types/common";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Request, Response } from "express";
import {
  AgentPropertiesInput,
  FeaturedAgentsInput,
  FeaturedAgentsResult,
  SearchByLocationInput,
} from "../libs/types/agent";
import { ExtendedRequest, UploadRequest, User } from "../libs/types/user";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { ObjectId } from "mongoose";
import { AgentPropertyType } from "../libs/enums/agent.enum";
import { SavingInput } from "../libs/types/userSaving";
import { TargetGroup } from "../libs/enums/userSaving.enum";
import { orrangeFiles } from "../libs/utils/orrangeFiles";
import { Agent } from "http";

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

////////////// -------------- SAVE TARGET BLOG --------------//////////////
agentController.saveToggleAgent = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("saveToggleAgent proccess");
    const { id } = req.params;
    const agentId = shapeIntoMongooseObjectId(id);
    const query: SavingInput = {
      targetId: shapeIntoMongooseObjectId(agentId),
      targetGroup: TargetGroup.AGENT,
      userId: shapeIntoMongooseObjectId(req.member._id),
    };
    const result = await agentService.saveToggleAgent(agentId, query);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in saveToggleAgent process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

//////////////// --- GET SAVED PROPERTIES -----------------
agentController.getFollowedAgents = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("getFollowedAgents proccess");

    const user = req.member;
    const { page, limit } = req.body;
    const query: CommonPageInput = {
      page: Number(page) || 1,
      limit: Number(limit) || 4,
    };

    const result = await agentService.getFollowedAgents(user, query);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getting getFollowedAgents: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////////////// ------------ AGENT APPLY -------------- /////////////////
agentController.agentApply = async (req: UploadRequest, res: Response) => {
  try {
    console.log("agentApply process");
    const input = req.body;

    const member = req.member as User;

    const avatar = req.files?.avatar;
    const certificate = req.files?.certificate;
    if (avatar?.length) {
      input.avatar = orrangeFiles(avatar)[0];
    }
    if (certificate?.length) {
      input.certificate = orrangeFiles(certificate)[0];
    }

    if (req.body?.socialLinks) {
      try {
        input.socialLinks = JSON.parse(req.body.socialLinks);
      } catch {
        throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_SOCIALS);
      }
    }

    input.yearOfExperience = Number.isFinite(input.yearOfExperience)
      ? input.yearOfExperience
      : 0;

    const result = await agentService.agentApply(input, member);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in agentApply procees: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////////////// ------------ AGENT UPDATE -------------- /////////////////
agentController.updateAgentProfile = async (
  req: UploadRequest,
  res: Response
) => {
  try {
    console.log("updateAgentProfile process");
    const input = req.body;
    const memberId = shapeIntoMongooseObjectId(req.member._id);

    const avatar = req.files?.avatar;
    const certificate = req.files?.certificate;
    if (avatar?.length) {
      input.avatar = orrangeFiles(avatar)[0];
    }
    if (certificate?.length) {
      input.certificate = orrangeFiles(certificate)[0];
    }

    if (req.body?.socialLinks) {
      try {
        input.socialLinks = JSON.parse(req.body.socialLinks);
      } catch {
        throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_SOCIALS);
      }
    }

    const exNum = Number(input.yearOfExperience);
    input.yearOfExperience = Number.isFinite(exNum) ? exNum : 0;

    const result = await agentService.updateAgentProfile(input, memberId);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in updateAgentProfile procees: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////////////// ------------ AGENT MY BLOG -------------- /////////////////
agentController.myBlogs = async (req: ExtendedRequest, res: Response) => {
  try {
    const member = req.member;
    const { limit, page } = req.body;
    const query: CommonPageInput = {
      page: Number(page || 1),
      limit: Number(limit || 6),
    };

    const result = await agentService.myBlogs(member, query);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in agent myBlogs: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

export default agentController;
