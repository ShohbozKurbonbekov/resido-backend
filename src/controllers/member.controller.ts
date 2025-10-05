import {
  UserMemberInput,
  User,
  LoginInput,
  ExtendedRequest,
  UserInputUpdate,
} from "../libs/types/user";
import { T } from "../libs/types/common";
import { Response, Request, NextFunction } from "express";
import MemberService from "../models/Member.service";
import { HttpCode, Message } from "../libs/Errors";
import Errors from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { jwtTime } from "../libs/config";

import {
  Agency,
  AgencyInputUpdate,
  AgencyMemberInput,
} from "../libs/types/agency";
import {
  Agent,
  AgentInputUpdate,
  FeaturedAgentsResult,
  MemberAgentInput,
} from "../libs/types/agent";
import makeUploader from "../libs/utils/uploader";
import { RecentPropertyForRent } from "../libs/types/property";

const memberController: T = {};
const memberService = new MemberService();
const authService = new AuthService();

///////////////////////////////// ----- SIGNUP ---- ///////////////////////////////////////////////////
memberController.getSignup = async (req: Request, res: Response) => {
  try {
    console.log("signup access completed");
    const input: UserMemberInput | AgencyMemberInput | MemberAgentInput =
      req.body;
    let result: User | Agency | Agent = await memberService.signup(input);
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
    const result: User | Agent | Agency = await memberService.getMemberDetail(
      req.member
    );

    res.status(HttpCode.OK).json({ member: result });
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
    const input: UserInputUpdate | AgencyInputUpdate | AgentInputUpdate =
      req.body;

    if (req.file) {
      input.avatar = req.file.path.replace(/\\/g, "/");
    }
    const result: Agency | Agent | User = await memberService.updateMember(
      req.member,
      input
    );
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

////////////////// ------------ GET FEATURED AGENTS ----------////////////////
memberController.getFeaturedAgents = async (req: Request, res: Response) => {
  try {
    console.log("getFeaturedAgents process");
    const input: RecentPropertyForRent = req.body;

    const result: FeaturedAgentsResult = await memberService.getFeaturedAgents(
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

//////////////////// -------- UPLOAD IMAGE ------------- //////////////////////
memberController.uploadMemberImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const upload = makeUploader("members").single("avatar");

  upload(req, res, (error: any) => {
    if (error) {
      res.status(400).json({
        error: error.message,
      });
    }

    next();
  });
};
export default memberController;
