import express, { Request, Response } from "express";
import { T } from "../libs/types/common";

const residoAdminController: T = {};
residoAdminController.goHome = async function (req: Request, res: Response) {
  try {
    res.send("Welcome Home");
  } catch (error) {
    console.log("ERROR: residoAdminController goHome", error);
  }
};

residoAdminController.getLogin = async function (req: Request, res: Response) {
  try {
    res.send("You have just logged in");
  } catch (error) {
    console.log("ERROR in residoAdminController getLogin: ", error);
  }
};

residoAdminController.getSignup = async function (res: Response, req: Request) {
  try {
    res.send("You have just signed up");
  } catch (error) {
    console.log("ERROR in residoAdmin getSignup: ", error);
  }
};

export default residoAdminController;
