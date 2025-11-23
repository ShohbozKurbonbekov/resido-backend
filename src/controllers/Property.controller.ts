import PropertyService from "../models/Property.service";
import { CommonUsers, T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import { ExtendedRequest, UploadRequest } from "../libs/types/user";
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
import { orrangeFiles } from "../libs/utils/orrangeFiles";
const propertyController: T = {};
const propertyService = new PropertyService();

//////////////////// --- CREATE PROPERTY -- //////////////
propertyController.createProperty = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("createProperty process");
    // if (!req.files?.length) {
    //   throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATING_FAILED);
    // }

    const input: PropertyInput = req.body;
    // input.images = req.files.map((file) => file.path.replace(/\\/g, "/"));

    await propertyService.createProperty(input);
    res.send(`
        <script>
        alert("successful creation");
        window.location.replace("/agent/properties/all")
        </script>`);
  } catch (error) {
    console.log("Error in createProperty controller: ", error);
    const message =
      error instanceof Errors ? error.message : Message.SOMETHING_WENT_WRONG;

    res.send(`
        <script>
        alert("${message}");
        window.location.replace("/agent/properties/all")
        </script>`);
  }
};

//////////////////// -- UPDATE PROPERTY --- ////////////
propertyController.updateProperty = async (
  req: UploadRequest,
  res: Response
) => {
  try {
    console.log("updateProperty process");
    const input: PropertyUpdateInput = req.body;
    const { id } = req.params;

    const images = req.files?.images;
    const videos = req.files?.videos;
    const propertyId = shapeIntoMongooseObjectId(id);

    if (videos?.length) {
      input.videos = orrangeFiles(videos);
    }

    if (images?.length) {
      input.images = orrangeFiles(images);
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

/////////////////// ---------- UPLOAD PROPERTIES ---------------- /////////////////////////////////
propertyController.uploadProperties = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const upload = makeUploader("properties").fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 1 },
  ]);

  upload(req, res, (error: any) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    next();
  });
};

/////////////////// ------- GET RECENT PROPERTIES FOR RENT -------------- ///////////////////////
propertyController.getRecentPropertiesForRent = async (
  req: Request,
  res: Response
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
  res: Response
) => {
  try {
    console.log("getFeaturedProperty process");
    const input: FeaturedPropertyInput = req.body;

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
  res: Response
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
  res: Response
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

/////////////////// ------ LIKE PROPERTY ---------- ///////////

propertyController.likeTargetProperty = async (
  req: ExtendedRequest,
  res: Response
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
export default propertyController;
