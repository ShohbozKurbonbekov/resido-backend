import { Request, Response } from "express";

import Errors, { Message, HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import { AgentLocation } from "../libs/types/agent";
import AgencyService from "../models/Agency.service";

const agencyController: T = {};
const agencyService = new AgencyService();

agencyController.getAgencyByLocation = async (req: Request, res: Response) => {
  try {
    // Checking input
    console.log("getAgencyByLocation process");
    const input: AgentLocation = req.body;

    // getting data
    const result = await agencyService.getAgencyByLocation(input);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error: in getAgencyByLocation process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

export default agencyController;
