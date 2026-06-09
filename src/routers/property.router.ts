import express from "express";
import memberController from "../controllers/member.controller";
import propertyController from "../controllers/Property.controller";
import { Message } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import { allowRoles } from "../middlewares/allowRoles";
import uploadFiles from "../middlewares/uploadFile";
const property = express.Router();

property.post(
  "/create",
  memberController.verifyMember,
  allowRoles(Message.PROPERTY_CREATE_AGENTS, MemberType.AGENT),
  uploadFiles("properties", "images", 5, true, true, "videos", 1),
  propertyController.createProperty,
);

//////////////////// -- PROPERTY UPDATE -- ////////////////////
property.post(
  "/update/:id",
  memberController.verifyMember,
  allowRoles(Message.PROPERTY_UPDATE_AGENTS, MemberType.AGENT),
  uploadFiles("properties", "images", 5, true, true, "videos", 1),
  propertyController.updateProperty,
);

///////////// --  GET RECENTLY ADDED PROPERTIES -- //////////
property.post(
  "/property-recent-rent",
  propertyController.getRecentPropertiesForRent,
);

////////////////// --  GET FEATURED PROPERTY -- /////////////
property.get("/featured-property", propertyController.getFeaturedProperty);

/////////////////// --  GET ALL PROPERTIES -- //////////////

property.post(
  "/getAll",
  memberController.checkMemberAuth,
  propertyController.getAllProducts,
);

////////////////// --  GET A CERTAIN PROPRERTY -- /////////////
property.get(
  "/:id",
  memberController.checkMemberAuth,
  propertyController.getProperty,
);

////////////////// --  GET PUBLISHER PROPERTY -- /////////////
property.get(
  "/publisher/:propertyId",
  memberController.verifyMember,
  propertyController.getPublisherProperty,
);

//////////////////// -- SAVE TARGET PROPERTY --- ///////////////
property.get(
  "/:id/toggle-save",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS_SAVE, MemberType.USER),
  propertyController.toggleSaveProperty,
);

//////////////////// -- GET SAVED PROPERTIES --- ///////////////
property.post(
  "/see/saved-properties",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS_SAVE_SEE, MemberType.USER),
  propertyController.getSavedProperties,
);

/////////////////// ------ PROPERTY LIKED ---------- ///////////

property.post(
  "/liked",
  memberController.verifyMember,
  allowRoles(Message.ONLY_USERS, MemberType.USER),
  propertyController.likeTargetProperty,
);
``;

// property.get("/pr");

export default property;
