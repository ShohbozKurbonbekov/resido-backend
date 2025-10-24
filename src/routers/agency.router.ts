import express from "express";
import memberController from "../controllers/member.controller";
import agencyController from "../controllers/Agency.controller";

const agency = express.Router();

//////////////// --  GET AGENCY DETAIL -- ////////////////////
agency.get(
  "/:id",
  memberController.checkMemberAuth,
  agencyController.getAgencyDetail
);

///////////////// GET AGENCY BY LOCATION ///////////////
agency.post("/search/byLocation", agencyController.getAgencyByLocation);

export default agency;
