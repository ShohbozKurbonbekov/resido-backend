import { Request, Response } from "express";
import chalk from "chalk";

import Errors, { Message, HttpCode } from "../libs/Errors";
import { CommonUsers, T } from "../libs/types/common";
import AgencyService from "../models/Agency.service";
import { ExtendedRequest, UploadRequest } from "../libs/types/user";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { SearchByLocationInput } from "../libs/types/agent";
import {
  AgencyAgePropertiesInput,
  AgencyAggregate,
  AgencyInputs,
} from "../libs/types/agency";
import { orrangeFiles } from "../libs/utils/orrangeFiles";
import { handleAgencyFrontEndInput } from "../libs/utils/handleAgencyFrontEndInputs";
import { Agency } from "../schema/members/Agency.model";

const agencyController: T = {};
const agencyService = new AgencyService();

/////////////////// GET AGENCY BY LOCATION////////////////
agencyController.getAgencyByLocation = async (req: Request, res: Response) => {
  try {
    // Checking input
    console.log(chalk.blue("getAgencyByLocation process"));

    const { page, limit, location } = req.body;
    const queries: SearchByLocationInput = {
      page: Number(page),
      limit: Number(limit),
    };

    if (location) {
      queries.location = location;
    }

    // getting data
    const result = await agencyService.getAgencyByLocation(queries);

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
    const member = <CommonUsers | null>req.member;

    const result = await agencyService.getAgencyDetail(member, agencyId);

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

//////////////////// GET AGENT AND PROPERTIES OF AGENCY ///////////
agencyController.getAgentsProperties = async (req: Request, res: Response) => {
  try {
    console.log("getAgentsProperties proccess: ");
    const { id } = req.params;
    const agencyId = shapeIntoMongooseObjectId(id);
    const { page, limit, location, agencyTarget } = req.body;
    const input: AgencyAgePropertiesInput = {
      page: Number(page) || 1,
      limit: Number(limit) || 6,
      agencyTarget,
    };

    if (location) {
      input.location = location;
    }

    const result = await agencyService.getAgentsProperties(agencyId, input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getAgentsProperties: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

//////////////////// APPLY FOR  AGENCY ///////////
agencyController.applyAgency = async (req: UploadRequest, res: Response) => {
  try {
    console.log("applyAgency proccess: ");
    const userId = shapeIntoMongooseObjectId(req.member._id);
    const input = handleAgencyFrontEndInput(req.body) as AgencyInputs;

    const certificate = req.files?.certificate;
    if (certificate?.length) {
      input.certificate = orrangeFiles(certificate)[0];
    }

    const result = await agencyService.applyAgency(userId, input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in applyAgency: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};
export default agencyController;
