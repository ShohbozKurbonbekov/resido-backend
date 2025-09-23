import express from "express";
import memberController from "./controllers/member.controller";

const router = express.Router();

router.get("/member/realEstateAdmin", memberController.getRealEstateAdmin);

// LOGIN
router.get("/login", memberController.getLogin);

// SIGNUP
router.post("/member/signup", memberController.getSignup);

export default router;
