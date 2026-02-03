import { Request, Response } from "express";
import { T } from "../libs/types/common";
import Errors, { Message, HttpCode } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import AdminService from "../models/AdminMember.service";
import { orrangeFiles } from "../libs/utils/orrangeFiles";
import { TarrifInputType } from "../libs/types/payment";
import TarrifService from "../models/Tarrif.service";
import { UploadRequest } from "../libs/types/user";
import AuthService from "../models/Auth.service";

const residoAdminController: T = {};
const adminService = new AdminService();
const tarrifService = new TarrifService();
const authService = new AuthService();

///////////////////////// PROCESS SINGNUP ///////////////////
residoAdminController.processSignup = async (
  req: UploadRequest,
  res: Response,
) => {
  try {
    console.log("process signup for Admin");
    const adminAvatar = req.files?.avatar;

    if (!adminAvatar?.length) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.IMAGE_NEEDED);
    }

    const input = req.body;
    input.avatar = orrangeFiles(adminAvatar)[0];
    input.role = MemberType.REAL_ESTATE_ADMIN;

    const result = await adminService.processSignup(input);

    const tokenPayload = {
      _id: result._id,
      role: result.role,
      memberStatus: result.memberStatus,
    };
    const token = await authService.createToken(tokenPayload);
    res.cookie("accessToken", token, {
      maxAge: 6 * 60 * 60 * 1000,
      httpOnly: true,
    });

    res.status(HttpCode.CREATED).json({ user: result, accessToken: token });
  } catch (error) {
    console.log("Error in admin signup: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

////////////////////////// ADD TARIFF///////////////////////
residoAdminController.addTarrif = async (req: Request, res: Response) => {
  try {
    const input: TarrifInputType = req.body;
    const result = await adminService.addTarrif(input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in addTarrif process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

export default residoAdminController;
