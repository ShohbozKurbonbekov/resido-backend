import { Request, Response } from "express";
import { T } from "../libs/types/common";
import Errors, { Message, HttpCode } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import AdminService from "../models/AdminMember.service";
import { orrangeFiles } from "../libs/utils/orrangeFiles";
import { ExtendedRequest, UploadRequest } from "../libs/types/user";
import AuthService from "../models/Auth.service";
import { TariffInputType } from "../libs/types/payment";
import TariffService from "../models/Tariff.service";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { AdminGetTariffsInput } from "../libs/types/admin";
import { TariffStatus } from "../libs/enums/payment.enum";
import { OrderRender } from "../libs/enums/common.enum";

const adminController: T = {};
const adminService = new AdminService();
const tariffService = new TariffService();
const authService = new AuthService();

///////////////////////// PROCESS SINGNUP ///////////////////
adminController.processSignup = async (req: UploadRequest, res: Response) => {
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
      httpOnly: false,
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
adminController.addTarrif = async (req: Request, res: Response) => {
  try {
    const input: TariffInputType = req.body;
    const result = await tariffService.addTarrif(input);
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

////////////////////////// FETCH ADMIN TARIFFS ///////////////////////
adminController.getAdminTariffs = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    const adminId = shapeIntoMongooseObjectId(req.member._id);
    const { page, limit, sort, status } = req.query;

    const allowedTariffStatus: TariffStatus[] = [
      TariffStatus.ACTIVE,
      TariffStatus.ARCHIVE,
      TariffStatus.DELETED,
    ];

    if (!allowedTariffStatus.includes(status as TariffStatus)) {
      throw new Errors(HttpCode.NOT_FOUND, Message.INVALID_TARIFF_STATUS);
    }

    const queries: AdminGetTariffsInput = {
      limit: Number(limit) || 3,
      page: Number(page) || 1,
      status: status as TariffStatus,
      sort: (sort as OrderRender) || OrderRender.DESC,
    };

    const result = await tariffService.getAdminTariffs(adminId, queries);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getAdminTariffs: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

export default adminController;
