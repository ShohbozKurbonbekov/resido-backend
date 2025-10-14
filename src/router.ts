import express from "express";
import memberController from "./controllers/member.controller";
import propertyController from "./controllers/Property.controller";
import commentController from "./controllers/Comment.controller";
import agentController from "./controllers/Agent.controller";

const router = express.Router();

/////////////////// ------ MEMBER ---------- ///////////

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

router.post("/member/featured-agents", memberController.getFeaturedAgents);

// LOGOUT
router.post(
  "/member/logout",
  memberController.verifyMember,
  memberController.logout
);

// WRITE A MESSAGE TO MEMBER
router.post(
  "/member/write/message",
  memberController.verifyMember,
  memberController.WriteMessageToMember
);

/////////////////// ------ PROPERTY ---------- ///////////
// CREATE PROPERTY
router.post(
  "/property/create",
  memberController.verifyMember,
  propertyController.uploadProperties,
  propertyController.createProperty
);

// GET RECENTLY ADDED PROPERTIES
router.post(
  "/property/property-recent-rent",
  propertyController.getRecentPropertiesForRent
);
export default router;

// GET FEATURED PROPERTY
router.post(
  "/property/featured-property",
  propertyController.getFeaturedProperty
);

// GET ALL PROPERTIES
router.get("/property/all", propertyController.getAllProducts);

// GET A CERTAIN PRODUCT
router.get(
  "/property/:id",
  memberController.verifyMember,
  propertyController.getProperty
);

router.post(
  "/property/liked",
  memberController.verifyMember,
  propertyController.likeTargetProperty
);

/////////////////// ------ COMMENT ---------- ///////////

// CREATE COMMENTS
router.post(
  "/member/create-comment",
  memberController.verifyMember,
  commentController.createComment
);

//  GET 10 LATEST COMMENTS
router.get("/member/comments/latest", commentController.getLatestComments);

////////////////////// ---- AGENT ---------- //////////////
router.post("/member/search/agent", agentController.getAgentByLocation);
router.get(
  "/agent/:id",
  memberController.checkMemberAuth,
  agentController.getAgentDetail
);

////////////////// LIKE TARGET AGENT /////////////////
router.post(
  "/agent/liked",
  memberController.checkMemberAuth,
  memberController.allowOnlyUsers,
  agentController.likeTargetAgent
);
