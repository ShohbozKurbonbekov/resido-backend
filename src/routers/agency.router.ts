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
  agencyController.getAgencyDetail,
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
  agencyController.applyAgency,
);

//////////////// --  AGENCY PRE-PAYMENT VALIDATION -- ////////////////////
agency.get(
  "/validation/pre-payment",
  memberController.verifyMember,
  allowRoles(Message.USER_PAGE, MemberType.USER),
  agencyController.validationPrePayment,
);

////////////// ---- AGENCY PAYMENT INFO SUBMIT -- //////////////////
agency.post(
  "/payment/info/submit",
  memberController.verifyMember,
  allowRoles(Message.USER_PAGE, MemberType.USER),
  agencyController.proceedPayment,
);

////////////// ---- AGENCY SUBCRIPTION INFO  -- //////////////////
agency.get(
  "/subscription/info",
  memberController.verifyMember,
  allowRoles(Message.AGENCY_ONLY, MemberType.AGENCY),
  agencyController.getSubscriptionInfo,
);
////////////// ---- RE-SUBCRIPTION -- //////////////////
agency.post(
  "/subscription/resubscribe",
  memberController.verifyMember,
  allowRoles(Message.AGENCY_ONLY, MemberType.AGENCY),
  agencyController.proceedPayment,
);

////////////// ---- AGENCY RENEW SUBCRIPTION  -- //////////////////
agency.post(
  "/subscription/renew",
  memberController.verifyMember,
  allowRoles(Message.AGENCY_ONLY, MemberType.AGENCY),
  agencyController.renewSubscription,
);

////////////// ---- AGENCY SUBCRIPTION CANCEL  -- //////////////////
agency.post(
  "/subscription/cancel",
  memberController.verifyMember,
  allowRoles(Message.AGENCY_ONLY, MemberType.AGENCY),
  agencyController.subscriptionCancel,
);

////////////////// -- AGENCY PTOFILE UPDATE --- ///////////////
agency.post(
  "/update/agency-profile",
  memberController.verifyMember,
  uploadAvatarCerticateFiles("agencies").fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "certificate",
      maxCount: 1,
    },
  ]),
  multerErrorHandler,
  agencyController.updateAgencyProfile,
);

//////////////////// -- MY BLOGS --- ///////////////
agency.get(
  "/get/myBlogs",
  memberController.verifyMember,
  agencyController.myBlogs,
);

/////////////////////// DELETE BLOGS ////////////////////
agency.post(
  "/delete/myBlog/:id",
  memberController.verifyMember,
  agencyController.deleteMyBlog,
);

/////////////////////// MY AGENTS' APPLICATIONS//////////////
agency.get(
  "/get/my-agents/applications",
  memberController.verifyMember,
  allowRoles(Message.AGENCY_ONLY, MemberType.AGENCY),
  agencyController.agentsApplications,
);

/////////////////////// GET AGENCY NOTIFICATIONS ///////////////
agency.get(
  "/get/notifications",
  memberController.verifyMember,
  allowRoles(Message.AGENCY_ONLY, MemberType.AGENCY),
  agencyController.agencyNotifications,
);

/////////////////////// REVIEW NOTIFICATION ///////////////
agency.post(
  "/review/notification/:entityId",
  memberController.verifyMember,
  allowRoles(Message.AGENCY_ONLY, MemberType.AGENCY),
  agencyController.reviewNotification,
);

///////////////////// AGENCY APPLICATION APPROVE//////////////
agency.post(
  "/approve/application/:id",
  memberController.verifyMember,
  allowRoles(Message.AGENCY_ONLY, MemberType.AGENCY),
  agencyController.agencyApproveApplication,
);

///////////////////// AGENCY APPLICATION REJECT //////////////
agency.post(
  "/reject/application/:id",
  memberController.verifyMember,
  allowRoles(Message.AGENCY_ONLY, MemberType.AGENCY),
  agencyController.agencyRejectApplication,
);

////////////////////////////// CHANGE PROPERTY STATUS OF AGENCY ///////////////////////////
agency.post(
  "/change/property-status/:id",
  memberController.verifyMember,
  allowRoles(Message.AGENCY_ONLY, MemberType.AGENCY),
  agencyController.changeAgenyPropertyStatus,
);

////////////////////////////// AGENCY DASHBOARD MY AGENTS ///////////////////////////
agency.get(
  "/dashboard/my-agents",
  memberController.verifyMember,
  allowRoles(Message.AGENCY_ONLY, MemberType.AGENCY),
  agencyController.dashboardMyAgents,
);

////////////////////////////// AGENCY CHANGE AGENT STATUS ///////////////////////////
agency.post(
  "/change/agent/status/:id",
  memberController.verifyMember,
  allowRoles(Message.AGENCY_ONLY, MemberType.AGENCY),
  agencyController.changeAgentStatus,
);

/////////////////////////////////// AGENCY DASHBOARD OVERVIEW ////////////////////////////
agency.get(
  "/dashboard/overview",
  memberController.verifyMember,
  allowRoles(Message.AGENCY_ONLY, MemberType.AGENCY),
  agencyController.agencyDashboardOverview,
);
export default agency;
