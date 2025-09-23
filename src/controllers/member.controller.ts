import { UserMemberInput, Agency, Agent, User } from "../libs/types/member";
import { T } from "../libs/types/common";
import { Response, Request } from "express";
import MemberService from "../models/Member.service";
import { MemberType } from "../libs/enums/member.enum";
import { HttpCode } from "../libs/Errors";
import Errors from "../libs/Errors";
import AuthService from "../models/Auth.service";
import { jwtTime } from "../libs/config";

const memberController: T = {};
const memberService = new MemberService();
const authService = new AuthService();

memberController.getRealEstateAdmin = async (req: Request, res: Response) => {
  try {
    console.log("get realEstateAdmin process");
  } catch (error) {
    console.log("Error in Home page: ", error);
  }
};

memberController.getLogin = async (req: Request, res: Response) => {
  try {
    res.send("Login Page");
  } catch (error) {
    console.log("Error in Login Page: ", error);
  }
};

memberController.getSignup = async (req: Request, res: Response) => {
  try {
    console.log("signup access completed");
    const input: UserMemberInput = req.body;
    let result: User;
    if (req.body.role === MemberType.USER) {
      result = await memberService.userSignup(input);
    } else {
      result = await memberService.userSignup(input);
    }
    console.log({ ...result });
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
