import { UserMemberInput, User } from "../libs/types/member";
import { T } from "../libs/types/common";
import { Response, Request } from "express";
import MemberService from "../models/Member.service";
import { MemberType } from "../libs/enums/member.enum";
import { HttpCode } from "../libs/Errors";
import Errors from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { jwtTime } from "../libs/config";
import { AgencyMemberInput } from "../libs/types/agency";
import { Agency } from "../libs/types/agency";
import { Agent, MemberAgentInput } from "../libs/types/agent";

const memberController: T = {};
const memberService = new MemberService();
const authService = new AuthService();

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

export default memberController;
