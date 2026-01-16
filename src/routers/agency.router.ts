import express from "express";
import memberController from "../controllers/member.controller";
import agencyController from "../controllers/Agency.controller";
import { allowRoles } from "../middlewares/allowRoles";
import { Message } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import uploadAvatarCerticateFiles from "../libs/utils/avatarCertificateUploader";
import multerErrorHandler from "../middlewares/errorHandler";

const agency = express.Router();

//////////////// --  GET AGENCY DETAIL -- ////////////////////
agency.get(
  "/:id",
  memberController.checkMemberAuth,
  agencyController.getAgencyDetail
);

//////////////// --  GET AGENCY PROPERTIES -- ////////////////////
agency.post("/:id/agents-properties", agencyController.getAgentsProperties);

///////////////// GET AGENCY BY LOCATION ///////////////
agency.post("/search/byLocation", agencyController.getAgencyByLocation);

///////////////// APPY FOR AGENCY POSITION ///////////////
agency.post(
  "/appy/agency-position",
  memberController.verifyMember,
  allowRoles(Message.USER_PAGE, MemberType.USER),
  uploadAvatarCerticateFiles("agencies").fields([
    {
      name: "certificate",
      maxCount: 1,
    },
  ]),
  multerErrorHandler,
  agencyController.applyAgency
);

//////////////// --  AGENCY PRE-PAYMENT VALIDATION -- ////////////////////
agency.get(
  "/validation/pre-payment",
  memberController.verifyMember,
  allowRoles(Message.USER_PAGE, MemberType.USER),
  agencyController.validationPrePayment
);

////////////// ---- AGENCY PAYMENT INFO SUBMIT -- //////////////////
agency.post(
  "/payment/info/submit",
  memberController.verifyMember,
  allowRoles(Message.USER_PAGE, MemberType.USER),
  agencyController.proceedPayment
);

export default agency;
