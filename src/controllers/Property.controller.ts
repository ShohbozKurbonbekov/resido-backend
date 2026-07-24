import PropertyService from "../models/Property.service";
import { CommonPageInput, CommonUsers, T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import { ExtendedRequest, UploadRequest, User } from "../libs/types/user";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  FeaturedPropertyInput,
  FeaturedPropertyResult,
  PropertyInput,
  PropertyUpdateInput,
  RecentPropertyForRent,
  RecentPropertyResult,
} from "../libs/types/property";
import makeUploader from "../libs/utils/uploader";
import buildPropertyInquery from "../libs/utils/buildPropertyInquery";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { SavingInput } from "../libs/types/userSaving";
import { TargetGroup } from "../libs/enums/userSaving.enum";
import { organizePropertyInput } from "../libs/utils/organizePropertyInput.ts";
import { arrangeFiles } from "../libs/utils/orrangeFiles";
const propertyController: T = {};
const propertyService = new PropertyService();

//////////////////// --- CREATE PROPERTY -- //////////////
propertyController.createProperty = async (
  req: UploadRequest,
  res: Response,
) => {
  try {
    console.log("createProperty process");
    const member = req.member;
    const input = organizePropertyInput(req.body);
    const images = req.files?.images;
    const video = req.files?.videos;
    if (images?.length) {
      input.images = arrangeFiles(images);
    }

    if (video?.length) {
      input.videos = arrangeFiles(video);
    }

    const result = await propertyService.createProperty(input, member);
    res.status(HttpCode.CREATED).json(result);
  } catch (error) {
    console.log("Error in createProperty: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

//////////////////// -- UPDATE PROPERTY --- ////////////
propertyController.updateProperty = async (
  req: UploadRequest,
  res: Response,
) => {
  try {
    console.log("updateProperty process");
    const input: PropertyUpdateInput = req.body;
    const { id } = req.params;

    const images = req.files?.images;
    const videos = req.files?.videos;
    const propertyId = shapeIntoMongooseObjectId(id);

    if (videos?.length) {
      input.videos = arrangeFiles(videos);
    }

    if (images?.length) {
      input.images = arrangeFiles(images);
    }

    const result = await propertyService.updateProperty(propertyId, input);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in updateProperty: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////// ------- GET RECENT PROPERTIES FOR RENT -------------- ///////////////////////
propertyController.getRecentPropertiesForRent = async (
  req: Request,
  res: Response,
) => {
  try {
    const input: RecentPropertyForRent = req.body;
    const result: RecentPropertyResult =
      await propertyService.getRecentPropertiesForRent(input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getRecentPropertiesForRent process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////////// --------- FEATURED PROPERTY ------------- ////////////////////////////
propertyController.getFeaturedProperty = async (
  req: Request,
  res: Response,
) => {
  try {
    console.log("getFeaturedProperty process");
    const { page, limit } = req.params;

    const input: FeaturedPropertyInput = {
      limit: Number(limit) || 4,
      page: Number(page) || 1,
    };

    const result: FeaturedPropertyResult =
      await propertyService.getFeaturedProperty(input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getFeaturedProperties: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////// --------------- GET ALL PRODUCTS ---------- ///////////////
propertyController.getAllProducts = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("GetAllProducts process");

    const member: CommonUsers | null = req.member;
    const queries: T = buildPropertyInquery(req.body);
    const result = await propertyService.getAllProperties(queries, member);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getAllProducts process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

//////////////////// --- GET A CERTAIN PROPERTY ////////////
propertyController.getProperty = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("getProperty Process");
    const propertyId = shapeIntoMongooseObjectId(req.params.id);
    const memberId = shapeIntoMongooseObjectId(req.member?._id);
    const result = await propertyService.getProperty(memberId, propertyId);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getProperty process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

//////////////////// --- GET A PUBLISHER PROPERTY ////////////
propertyController.getPublisherProperty = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("getPublisherProperty Process");
    const propertyId = shapeIntoMongooseObjectId(req.params.propertyId);
    const member = req.member;
    const result = await propertyService.getPublisherProperty(
      member,
      propertyId,
    );

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getPublisherProperty: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

/////////////////// ------ LIKE PROPERTY ---------- ///////////

propertyController.likeTargetProperty = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("LikeTargetProperty process");

    const userId = shapeIntoMongooseObjectId(req.member._id);
    const propertyId = req.body.input;

    const result = await propertyService.likeTargetProperty(userId, propertyId);

    res.status(HttpCode.CREATED).json(result);
  } catch (error) {
    console.log("Error in LiketargetProperty process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

//////////////// --- SAVE TARGET PROPERTY -----------------
propertyController.toggleSaveProperty = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("toggleSave process");
    const { id } = req.params;
    const propertyId = shapeIntoMongooseObjectId(id);
    const member = req?.member;
    const query: SavingInput = {
      targetGroup: TargetGroup.PROPERTY,
      targetId: propertyId,
      userId: shapeIntoMongooseObjectId(member?._id),
    };

    const result = await propertyService.toggleSaveProperty(propertyId, query);

    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in saveTargetProperty: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

//////////////// --- GET SAVED PROPERTIES -----------------
propertyController.getSavedProperties = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log(" getSavedProperties proccess");

    const user = req.member;
    const { page, limit } = req.body;
    const query: CommonPageInput = {
      page: Number(page) || 1,
      limit: Number(limit) || 4,
    };

    const result = await propertyService.getSavedProperties(user, query);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in getting saved properties: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

export default propertyController;
