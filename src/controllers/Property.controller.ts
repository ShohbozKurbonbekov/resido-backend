import PropertyService from "../models/Property.service";
import { T } from "../libs/types/common";
import { Request, Response } from "express";
import { ExtendedRequest } from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { PropertyInput } from "../libs/types/property";

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

export default propertyController;
