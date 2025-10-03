import PropertyService from "../models/Property.service";
import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import { ExtendedRequest } from "../libs/types/user";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  PropertyInput,
  RecentForRentInput,
  RecentForRentOutput,
} from "../libs/types/property";
import makeUploader from "../libs/utils/uploader";
const propertyController: T = {};
const propertyService = new PropertyService();

propertyController.createProperty = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    console.log("/////////////////////////////////////////");
    console.log("files here", req.files);
    console.log("createProperty process");
    if (!req.files?.length) {
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATING_FAILED);
    }

    const data: PropertyInput = req.body;
    data.images = req.files.map((file) => file.path.replace(/\\/g, "/"));

    await propertyService.createProperty(data);
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
    const input: RecentForRentInput = req.body;
    const result: RecentForRentOutput =
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

export default propertyController;
