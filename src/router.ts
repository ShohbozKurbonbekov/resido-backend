import express from "express";
import memberController from "./controllers/member.controller";
import propertyController from "./controllers/Property.controller";

const router = express.Router();

// SIGNUP
router.post("/member/signup", memberController.getSignup);

// LOGIN
router.post("/member/login", memberController.login);

// MEMBER DETAIL
router.get(
  "/member/detail",
  memberController.verifyMember,
  memberController.getMemberDetail
);

// MEMBER UPDATE
router.post(
  "/member/update",
  memberController.verifyMember,
  memberController.uploadMemberImage,
  memberController.updateMember
);

// LOGOUT
router.post(
  "/member/logout",
  memberController.verifyMember,
  memberController.logout
);

// CREATE PROPERTY
router.post(
  "/property/create",
  memberController.verifyMember,
  propertyController.uploadProperties,
  propertyController.createProperty
);
export default router;
