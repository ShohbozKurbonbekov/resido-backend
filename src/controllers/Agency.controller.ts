import { Request, Response } from "express";
import chalk from "chalk";

import Errors, { Message, HttpCode } from "../libs/Errors";
import { CommonPageInput, CommonUsers, T } from "../libs/types/common";
import AgencyService from "../models/Agency.service";
import { ExtendedRequest, UploadRequest } from "../libs/types/user";
import { jwtTime, shapeIntoMongooseObjectId } from "../libs/config";
import { SearchByLocationInput } from "../libs/types/agent";
import {
  AgencyAgentsApplicationInput,
  AgencyAgePropertiesInput,
  AgencyInputs,
} from "../libs/types/agency";
import { orrangeFiles } from "../libs/utils/orrangeFiles";
import { handleAgencyFrontEndInput } from "../libs/utils/handleAgencyFrontEndInputs";
import AuthService from "../models/Auth.service";
import AgencySubscribeService from "../models/AgencySubscribe.service";
import { SubscriptionMode } from "../libs/enums/payment.enum";
import { AgentStatus } from "../libs/enums/agent.enum";

const agencyController: T = {};
const agencyService = new AgencyService();
const authService = new AuthService();
const agencySubscribeService = new AgencySubscribeService();

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
  res: Response,
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

/////////////////// VALIDATION - PREPAYMENT ///////////
agencyController.validationPrePayment = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("validationPrePayment proccess: ");
    const userId = shapeIntoMongooseObjectId(req.member._id);

    const result = await agencyService.validationPrePayment(userId);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in validationPrePayment: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////// AGENCY PAYMENT INFO SUBMIT /////////////////
agencyController.proceedPayment = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    const userId = shapeIntoMongooseObjectId(req.member._id);

    const inputs = req.body;

    const mode: SubscriptionMode =
      await agencySubscribeService.getLatestSubscription(req.member);

    const result = await agencySubscribeService.createSubscription(
      inputs,
      userId,
      mode,
    );

    if (mode === SubscriptionMode.FIRST_SUBSCRIBE) {
      const user = result as CommonUsers;
      const tokenPayload = {
        _id: user._id,
        memberStatus: user.memberStatus,
        role: user.role,
      };
      const token: string = await authService.createToken(tokenPayload);

      res.cookie("accessToken", token, {
        maxAge: jwtTime * 60 * 60 * 1000,
        httpOnly: false,
      });
    }
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in proceedPayment: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////// AGENCY  SUBCRIPTION INFO /////////////////
agencyController.getSubscriptionInfo = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("getSubscriptionInfo procces");
    const agencyMember = req.member;
    const result =
      await agencySubscribeService.getSubscriptionInfo(agencyMember);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getSubscriptionInfo: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////// AGENCY  SUBCRIPTION  CANCEL /////////////////
agencyController.subscriptionCancel = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("subscriptionCancel procces");
    const agencyMember = req.member;
    const result =
      await agencySubscribeService.subscriptionCancel(agencyMember);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in subscriptionCancel: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////// RE SUBSCRIPTION ///////////////////////
agencyController.renewSubscription = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("resubscription proccess");
    const memberId = shapeIntoMongooseObjectId(req.member._id);
    const { id } = req.body;
    const subId = shapeIntoMongooseObjectId(id);

    if (!subId) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_INPUT);
    }
    const result = await agencySubscribeService.renewSubscription(
      memberId,
      subId,
    );
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in resubscription: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////////////// ------------ AGENCY PROFILE UPDATE -------------- /////////////////
agencyController.updateAgencyProfile = async (
  req: UploadRequest,
  res: Response,
) => {
  try {
    console.log("updateAgencyProfile process");
    const input = handleAgencyFrontEndInput(req.body);
    const agencyId = shapeIntoMongooseObjectId(req.member._id);

    const avatar = req.files?.avatar;
    const certificate = req.files?.certificate;
    if (avatar?.length) {
      input.avatar = orrangeFiles(avatar)[0];
    }
    if (certificate?.length) {
      input.certificate = orrangeFiles(certificate)[0];
    }

    if (req.body?.socialLinks) {
      input.socialLinks = JSON.parse(req.body.socialLinks);
    }

    const result = await agencyService.updateAgencyProfile(input, agencyId);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in updateAgencyProfile: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////////////// ------------ AGENCY MY BLOG -------------- /////////////////
agencyController.myBlogs = async (req: ExtendedRequest, res: Response) => {
  try {
    const member = req.member;
    const { limit, page } = req.query;
    const query: CommonPageInput = {
      page: Number(page || 1),
      limit: Number(limit || 6),
    };

    const result = await agencyService.myBlogs(member, query);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in agency myBlogs: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////// ---- DELETE MY BLOG ------////////////////////
agencyController.deleteMyBlog = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("deleteMyBlog process in agencyController");
    const memberId = shapeIntoMongooseObjectId(req.member._id);
    const { id } = req.params;
    const targetId = shapeIntoMongooseObjectId(id);
    const result = await agencyService.deleteMyBlog(memberId, targetId);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in deleteMyBlog process of agencyController: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////////------  AGENCY AGENTS APPLICATIONS ----///////////////////////
agencyController.agentsApplications = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("agentsApplications proccess");
    const agencyId = shapeIntoMongooseObjectId(req.member._id);
    const { currentStatus, page, limit } = req.query;
    const queries: AgencyAgentsApplicationInput = {
      limit: Number(limit) || 6,
      page: Number(page) || 1,
      currentStatus: (currentStatus as AgentStatus) || AgentStatus.AVAILABLE,
    };

    const result = await agencyService.agentsApplications(agencyId, queries);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in agentsApplications: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////// ---- AGENCY NOTIFICATIONS ////////////////
agencyController.agencyNotifications = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("agencyNotifications proccess");
    const agencyId = shapeIntoMongooseObjectId(req.member._id);
    const { page, limit } = req.query;
    const queries: CommonPageInput = {
      page: Number(page) || 1,
      limit: Number(limit) || 5,
    };

    const result = await agencyService.agencyNotifications(agencyId, queries);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in agencyNotifications: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////// ---- REVIEW NOTIFICATIONS////////////////
agencyController.reviewNotification = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("reviewNotification proccess");
    const agencyId = shapeIntoMongooseObjectId(req.member._id);
    const { entityId } = req.params;

    const result = await agencyService.reviewNotification(agencyId, entityId);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in reviewNotification: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};
////////////////////------  AGENCY APPLICATION APPROVE ----///////////////////////
agencyController.agencyApproveApplication = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("agencyApproveApplication proccess");
    const agencyId = shapeIntoMongooseObjectId(req.member._id);
    const { id } = req.params;
    const agentId = shapeIntoMongooseObjectId(id);

    const result = await agencyService.agencyApproveApplication(
      agencyId,
      agentId,
    );
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in agencyApproveApplication: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

export default agencyController;
