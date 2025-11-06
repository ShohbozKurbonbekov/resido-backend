import express from "express";
import memberController from "../controllers/member.controller";
import propertyController from "../controllers/Property.controller";
import { allowRoles } from "../libs/config";
import { Message } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
const property = express.Router();

property.post(
  "/create",
  memberController.verifyMember,
  allowRoles(Message.PROPERTY_CREATE_AGENTS, MemberType.AGENT),
  propertyController.uploadProperties,
  propertyController.createProperty
);

//////////////////// -- PROPERTY UPDATE -- ////////////////////
property.post(
  "/update/:id",
  memberController.verifyMember,
  allowRoles(Message.PROPERTY_UPDATE_AGENTS, MemberType.AGENT),
  propertyController.uploadProperties,
  propertyController.updateProperty
);

///////////// --  GET RECENTLY ADDED PROPERTIES -- //////////
property.post(
  "/property-recent-rent",
  propertyController.getRecentPropertiesForRent
);

////////////////// --  GET FEATURED PROPERTY -- /////////////
property.post("/featured-property", propertyController.getFeaturedProperty);

/////////////////// --  GET ALL PROPERTIES -- //////////////

property.post(
  "/getAll",
  memberController.checkMemberAuth,
  propertyController.getAllProducts
);

////////////////// --  GET A CERTAIN PRODUCT -- /////////////
property.get(
  "/:id",
  memberController.checkMemberAuth,
  propertyController.getProperty
);

/////////////////// ------ PROPERTY LIKED ---------- ///////////

property.post(
  "/liked",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS, MemberType.USER),
  propertyController.likeTargetProperty
);

export default property;
