import {
  UserMemberInput,
  LoginInput,
  ExtendedRequest,
  UploadRequest,
} from "../libs/types/user";
import { CommonPageInput, T } from "../libs/types/common";
import { Response, Request, NextFunction } from "express";
import MemberService from "../models/Member.service";
import { HttpCode, Message } from "../libs/Errors";
import Errors from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { jwtTime, shapeIntoMongooseObjectId } from "../libs/config";
import { MessageInput } from "../libs/types/message";
import { MemberType } from "../libs/enums/member.enum";
import { orrangeFiles } from "../libs/utils/orrangeFiles";
import TarrifService from "../models/Tarrif.service";

const memberController: T = {};
const memberService = new MemberService();
const authService = new AuthService();
const tariffService = new TarrifService();
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
    const input: UserMemberInput = req.body;
    let result = await memberService.signup(input);
    const tokenPayload = {
      _id: result._id,
      role: result.role,
      memberStatus: result.memberStatus,
    };
    const token = await authService.createToken(tokenPayload);
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

    const result = await memberService.login(input);

    const tokenPayload = {
      _id: result._id,
      memberStatus: result.memberStatus,
      role: result.role,
    };
    const token: string = await authService.createToken(tokenPayload);

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
  res: Response,
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
memberController.updateMember = async (req: UploadRequest, res: Response) => {
  try {
    console.log("memberUpdate controller");
    const member = req.member;
    const input = req.body;
    const avatar = req.files?.avatar;
    if (avatar?.length) {
      input.avatar = orrangeFiles(avatar)[0];
    }
    let socials;
    if (
      member.role === MemberType.USER ||
      member.role === MemberType.REAL_ESTATE_ADMIN
    ) {
      socials = JSON.parse(req.body.memberSocials);
      input.memberSocials = socials;
    }
    if (member.role === MemberType.AGENCY || member.role === MemberType.AGENT) {
      socials = JSON.parse(req.body.socialLinks);
      input.socialLinks = socials;
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
  res: Response,
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
  res: Response,
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
  res: Response,
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

/////////////////////////// GET PUBLIC TARIFFS /////////////////////
memberController.getPublicTariffs = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;
    const queries: CommonPageInput = {
      page: Number(page) || 1,
      limit: Number(limit) || 3,
    };
    const result = await tariffService.getPublicTariffs(queries);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getPublicTariffs: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////////////// GET PUBLIC TARIFF ONE /////////////////////
memberController.getPublicTariffOne = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tarrifId = shapeIntoMongooseObjectId(id);

    const result = await tariffService.getPublicTariffOne(tarrifId);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getPublicTariffOne: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

//////////////////// VERIFY MEMBER ////////////////
memberController.verifyMember = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
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
  next: NextFunction,
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

//////////////////////// USER DASHBOARD -//////////////////////////
memberController.userDashboardOverview = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("userDashboardOverview process");
    const member = req.member;
    const result = await memberService.userDashboardOverview(member);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in userDashboardOverview: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

export default memberController;
