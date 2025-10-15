import { Request, Response } from "express";
import chalk from "chalk";

import Errors, { Message, HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import { AgentLocation } from "../libs/types/agent";
import AgencyService from "../models/Agency.service";
import { ExtendedRequest } from "../libs/types/user";
import { shapeIntoMongooseObjectId } from "../libs/config";

const agencyController: T = {};
const agencyService = new AgencyService();

/////////////////// GET AGENCY BY LOCATION////////////////
agencyController.getAgencyByLocation = async (req: Request, res: Response) => {
  try {
    // Checking input
    console.log(chalk.blue("getAgencyByLocation process"));

    const input: AgentLocation = req.body;

    // getting data
    const result = await agencyService.getAgencyByLocation(input);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log(chalk.bgRed("Error: in getAgencyByLocation process: "), error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////// GET AGENCY DETAIL ///////////////////
agencyController.getAgencyDetail = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log(chalk.bgGreen("getAgencyDetail process"));
    const { id } = req.params;
    const agencyId = shapeIntoMongooseObjectId(id);
    const memberId = shapeIntoMongooseObjectId(req.member._id);

    const result = await agencyService.getAgencyDetail(memberId, agencyId);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log(chalk.bgRed("Error in getAgencyDetail process: "), error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};
export default agencyController;
