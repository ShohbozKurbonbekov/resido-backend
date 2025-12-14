import {
  UserMemberInput,
  User,
  LoginInput,
  ExtendedRequest,
  UserInputUpdate,
} from "../libs/types/user";
import {
  CommonPageInput,
  CommonUsers,
  CommonUsersUpdateInput,
  T,
} from "../libs/types/common";
import { Response, Request, NextFunction } from "express";
import MemberService from "../models/Member.service";
import { HttpCode, Message } from "../libs/Errors";
import Errors from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { jwtTime, shapeIntoMongooseObjectId } from "../libs/config";

import { AgencyInputUpdate, AgencyMemberInput } from "../libs/types/agency";
import {
  Agent,
  AgentInputUpdate,
  AgentResults,
  FeaturedAgentsInput,
  FeaturedAgentsResult,
  MemberAgentInput,
} from "../libs/types/agent";
import makeUploader from "../libs/utils/uploader";
import { RecentPropertyForRent } from "../libs/types/property";
import { MessageInput } from "../libs/types/message";
import residoAdminController from "./resido-admin.controller";
import { MemberType } from "../libs/enums/member.enum";
import { Agency } from "../schema/members/Agency.model";

const memberController: T = {};
const memberService = new MemberService();
const authService = new AuthService();
/////////////////////////////// ----- PUBLIC ADMIN ---- ///////////////////////////////////////////////////
memberController.getAdmin = async (req: Request, res: Response) => {
  try {
    console.log("getAdmin proccess");

    const result = await memberService.getAdmin();
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getting admin: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////////////////// ----- SIGNUP ---- ///////////////////////////////////////////////////
memberController.getSignup = async (req: Request, res: Response) => {
  try {
    console.log("signup process");
    const input: UserMemberInput | AgencyMemberInput | MemberAgentInput =
      req.body;
    let result: CommonUsers = await memberService.signup(input);
    // create token
    const token = await authService.createToken(result);
    res.cookie("accessToken", token, {
      maxAge: jwtTime * 60 * 60 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.CREATED).json({ user: result, accessToken: token });
  } catch (error) {
    console.log("Error: in getSignup", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

///////////////////////////////// ----- LOGIN ---- ///////////////////////////////////////////////////
memberController.login = async (req: Request, res: Response) => {
  try {
    console.log("login");
    const input: LoginInput = req.body;

    const result: User | Agency | Agent = await memberService.login(input);

    const token: string = await authService.createToken(result);

    res.cookie("accessToken", token, {
      maxAge: jwtTime * 60 * 60 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json({
      member: result,
      accessToken: token,
    });
  } catch (error) {
    console.log("Error in login proccess: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

//////////////////////////////// ------- GET MEMBER DETAIL--- /////////////////////////////////////
memberController.getMemberDetail = async (
  req: ExtendedRequest,
  res: Response
) => {
  console.log("getting a specific member detail");
  try {
    const member = req.member;
    const result = await memberService.getMemberDetail(member);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getMemberDetail controller: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////////////// ------------ UPLOAD MEMBER -------------- /////////////////
memberController.updateMember = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("memberUpdate controller");
    const member = req.member;
    const input: CommonUsersUpdateInput = req.body;

    if (req.file) {
      input.avatar = req.file.path.replace(/\\/g, "/");
    }
    const result = await memberService.updateMember(member, input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in updateMember procees: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

///////////////////////////////// ----- LOGOUT ---- ///////////////////////////////////////////////////
memberController.logout = async (req: Request, res: Response) => {
  try {
    res.cookie("accessToken", null, {
      maxAge: 0,
      httpOnly: true,
    });
    res.status(HttpCode.OK).json({ logout: true });
  } catch (error) {
    console.log("Error in logout controller: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

///////////////////
// ---- WRITE A MESSAGE TO MEMBER ------////////////////////
memberController.WriteMessageToMember = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("WriteMessageToMember process");
    const member = req.member;
    const input: MessageInput = req.body;

    const result = await memberService.WriteMessageToMember(member, input);

    res.status(HttpCode.CREATED).json(result);
  } catch (error) {
    console.log("Error in WriteMessageToMember process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////// ---- GET  ALL  MEMBER MESSAGES ------////////////////////
memberController.getMemberMessages = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("getMemberMessages process");
    const member = req.member;
    const query: CommonPageInput = req.body;

    const result = await memberService.getMemberMessages(member, query);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getMemberMessages process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////// ---- DELETE MEMBER MESSAGE ------////////////////////
memberController.messageDelete = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("messageDelete process");
    const memberId = shapeIntoMongooseObjectId(req.member._id);
    const { id } = req.params;
    const targetId = shapeIntoMongooseObjectId(id);
    const result = await memberService.messageDelete(memberId, targetId);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in messageDelete process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////// ---- EDIT  MEMBER MESSAGE ------////////////////////
memberController.messageEdit = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("messageEdit process");
    const memberId = shapeIntoMongooseObjectId(req.member._id);
    const { id } = req.params;
    const targetId = shapeIntoMongooseObjectId(id);
    const { content } = req.body;
    const query: T = { memberId, targetId, content };
    const result = await memberService.messageEdit(query);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in messageEdit process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////// -------- READ A MESSAGE -- ////////////////////
memberController.messageRead = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("messageRead process");

    const { id } = req.params;
    const targetId = shapeIntoMongooseObjectId(id);
    const member = req.member;
    const result = await memberService.messageRead(member, targetId);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in messageRead: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(error);
    }
  }
};

//////////////////// VERIFY MEMBER ////////////////
memberController.verifyMember = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token: string | undefined = req.cookies?.accessToken;
    if (token) {
      req.member = await authService.checkAuth(token);
    }

    if (!req.member) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);
    }

    next();
  } catch (error) {
    console.log("Error in veryAuth: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

//////////////////////// SHALLOW CHECK -//////////////////////////
memberController.checkMemberAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token: string = await req.cookies?.accessToken;
    if (token) {
      req.member = await authService.checkAuth(token);
    }
    next();
  } catch (error) {
    console.log("Error in CheckMemberAuth: ", error);
    next();
  }
};

export default memberController;
