import AgentService from "../models/Agent.service";
import { T } from "../libs/types/common";
import Errors, { HttpCode } from "../libs/Errors";
import { Request, Response } from "express";
import { AgentLocation } from "../libs/types/agent";

const agentController: T = {};
const agentService = new AgentService();

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

export default agentController;
