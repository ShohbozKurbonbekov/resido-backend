import express from "express";
import memberController from "./controllers/member.controller";
import makeUploader from "./libs/utils/uploader";
import propertyController from "./controllers/Property.controller";
import { error } from "console";
import { ExtendedRequest } from "./libs/types/member";
import { Request, Response, NextFunction } from "express";

const router = express.Router();

// SIGNUP
router.post("/member/signup", memberController.getSignup);
router.post("/member/login", memberController.login);
export default router;

// CREATE PROPERTY

const uploadProperties = (req: Request, res: Response, next: NextFunction) => {
  const upload = makeUploader("properties").array("images");

  upload(req, res, (error: any) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    next();
  });
};
router.post(
  "/property/create",
  memberController.verifyMember,
  uploadProperties,
  propertyController.createProperty
);
