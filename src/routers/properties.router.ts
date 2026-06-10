import express from "express";
import propertyController from "../controllers/Property.controller";
import propertiesController from "../controllers/Properties.controller";
import memberController from "../controllers/member.controller";
const properties = express.Router();

properties.get(
  "/",
  memberController.checkMemberAuth,
  propertiesController.getProperties,
);
export default properties;
