import { Request, Response } from "express";
import { CommonPageInput, StatusChangeType, T } from "../libs/types/common";
import Errors, { Message, HttpCode } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import AdminService from "../models/AdminMember.service";
import { orrangeFiles } from "../libs/utils/orrangeFiles";
import { ExtendedRequest, UploadRequest } from "../libs/types/user";
import AuthService from "../models/Auth.service";
import { AdminAddTariffInput, TariffInputType } from "../libs/types/payment";
import TariffService from "../models/Tariff.service";
import { shapeIntoMongooseObjectId } from "../libs/config";
import {
  AdminChangeTariffStatusQuery,
  AdminGetTariffsInput,
} from "../libs/types/admin";
import { TariffStatus } from "../libs/enums/payment.enum";
import { OrderRender } from "../libs/enums/common.enum";
import { CommentStatus } from "../libs/enums/comment.enum";
import CommentService from "../models/Comment.service";

const adminController: T = {};
const adminService = new AdminService();
const tariffService = new TariffService();
const authService = new AuthService();
const commentService = new CommentService();

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
adminController.addTarrif = async (req: ExtendedRequest, res: Response) => {
  console.log("AddTariff proccesss");
  try {
    const input = tariffService.customiseAdminTariffFormInputs(req.body);
    const adminId = shapeIntoMongooseObjectId(req.member._id);

    const result = await tariffService.addTarrif(adminId, input);

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

////////////////////////// EDIT TARIFF///////////////////////
adminController.editTariff = async (req: ExtendedRequest, res: Response) => {
  console.log("editTariff proccesss");
  try {
    const input = tariffService.customiseAdminTariffFormInputs(req.body);
    const adminId = shapeIntoMongooseObjectId(req.member._id);
    const { id } = req.params;
    const tariffId = shapeIntoMongooseObjectId(id);
    const result = await tariffService.editTariff(adminId, tariffId, input);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in editTarrif process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////////// CHANGE ADMIN TARIFF STATUS //////////////
adminController.adminChangeTariffStatus = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("adminChangeTariffStatus proccess");
    const adminId = shapeIntoMongooseObjectId(req.member._id);
    const { id, status } = req.query;

    const allowedTariffStatus = [
      TariffStatus.ACTIVE,
      TariffStatus.ARCHIVE,
      TariffStatus.DELETED,
    ];

    if (!allowedTariffStatus.includes(status as TariffStatus)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_TARIFF_STATUS);
    }

    const queries: AdminChangeTariffStatusQuery = {
      status: status as TariffStatus,
      tariffId: shapeIntoMongooseObjectId(id),
    };

    const result = await tariffService.adminChangeTariffStatus(
      adminId,
      queries,
    );

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in adminChangeTariffStatus: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////////// GET COMMENTS FOR ADMIN //////////////
adminController.getCommentsForAdmin = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("getCommentsForAdmin proccess");
    const adminId = shapeIntoMongooseObjectId(req.member._id);
    const { page, limit, status, username } = req.query;

    const queries: CommonPageInput & {
      status?: CommentStatus;
      username?: string;
    } = {
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      status: status as CommentStatus,
      username: username as string,
    };

    const result = await commentService.getCommentsForAdmin(adminId, queries);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getCommentsForAdmin: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////////// ADMIN CHANGE COMMENT STATUS ///////////////////
adminController.adminChangeCommentStatus = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("adminChangeCommentStatus proccess");
    const { id } = req.params;
    const commentId = shapeIntoMongooseObjectId(id);
    const { status } = req.body;
    const adminId = shapeIntoMongooseObjectId(req.member._id);

    const queries: StatusChangeType<CommentStatus> = {
      id: commentId,
      status,
    };

    const result = await commentService.adminChangeCommentStatus(
      adminId,
      queries,
    );
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in adminChangeCommentStatus: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

export default adminController;
