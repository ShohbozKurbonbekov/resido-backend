import PropertyService from "../models/Property.service";
import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import { ExtendedRequest } from "../libs/types/user";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  PropertyInput,
  PropertyInquery,
  RecentPropertyForRent,
  RecentPropertyResult,
} from "../libs/types/property";
import makeUploader from "../libs/utils/uploader";
const propertyController: T = {};
const propertyService = new PropertyService();

propertyController.createProperty = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("createProperty process");
    if (!req.files?.length) {
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATING_FAILED);
    }

    const input: PropertyInput = req.body;
    input.images = req.files.map((file) => file.path.replace(/\\/g, "/"));

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
        alert(${message});
        window.location.replace("/agent/properties/all")
        </script>`);
  }
};

/////////////////// ---------- UPLOAD PROPERTIES ---------------- /////////////////////////////////
propertyController.uploadProperties = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const upload = makeUploader("properties").array("images");

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
    const input: RecentPropertyForRent = req.body;

    const result: RecentPropertyResult =
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
propertyController.getAllProducts = async (req: Request, res: Response) => {
  try {
    console.log("GetAllProducts process");
    const input: PropertyInquery = req.body;
    const {
      page,
      limit,
      order,
      propertyAmenities,
      propertyBedrooms,
      propertyLocation,
      propertyMood,
      propertyPriceRange,
      propertySuperAgent,
      propertyType,
      propertyVerified,
      propertySearch,
    } = input;
    const inquery: PropertyInquery = {
      order: order,
      page: Number(page),
      limit: Number(limit),
    };

    if (propertySearch) inquery.propertySearch = propertySearch;
    if (propertyAmenities) inquery.propertyAmenities = propertyAmenities;

    if (propertyBedrooms) inquery.propertyBedrooms = Number(propertyBedrooms);

    if (propertyLocation) inquery.propertyLocation = propertyLocation;

    if (propertyMood) inquery.propertyMood = propertyMood;

    if (propertyPriceRange)
      inquery.propertyPriceRange = Number(propertyPriceRange);

    if (propertySuperAgent)
      inquery.propertySuperAgent = Boolean(propertySuperAgent);

    if (propertyType) inquery.propertyType = propertyType;

    if (propertyVerified) inquery.propertyVerified = Boolean(propertyVerified);

    const result = await propertyService.getAllProperties(inquery);

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
export default propertyController;
