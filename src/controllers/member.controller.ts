import { T } from "../libs/types/common";
import { Response, Request } from "express";

const memberController: T = {};

memberController.goHome = async (req: Request, res: Response) => {
  try {
    res.send("Home Page");
  } catch (error) {
    console.log("Error in Home page: ", error);
  }
};

memberController.getLogin = async (req: Request, res: Response) => {
  try {
    res.send("Login Page");
  } catch (error) {
    console.log("Error in Login Page: ", error);
  }
};

memberController.getSignup = (req: Request, res: Response) => {
  try {
    res.send("Signup Page");
  } catch (error) {
    console.log("Error in Signup Page: ", error);
  }
};

export default memberController;
