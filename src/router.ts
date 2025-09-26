import express from "express";
import memberController from "./controllers/member.controller";

const router = express.Router();

// SIGNUP
router.post("/member/signup", memberController.getSignup);
router.post("/member/login", memberController.login);
export default router;
