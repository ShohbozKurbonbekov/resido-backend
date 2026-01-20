import express, { NextFunction, Request, Response } from "express";
import { CommonPageInput, T } from "../libs/types/common";
import makeUploader from "../libs/utils/uploader";
import { AdminRequest } from "../libs/types/admin";
import Errors, { Message, HttpCode } from "../libs/Errors";
import { MemberType } from "../libs/enums/member.enum";
import AdminService from "../models/AdminMember.service";
import { orrangeFiles } from "../libs/utils/orrangeFiles";
import { TarrifInputType } from "../libs/types/payment";
import TarrifService from "../models/Tarrif.service";

const residoAdminController: T = {};
const adminService = new AdminService();
const tarrifService = new TarrifService();

///////////////////////////// GO GOME /////////////////////
residoAdminController.goHome = async function (req: Request, res: Response) {
  try {
    res.send("Welcome Home");
  } catch (error) {
    console.log("ERROR: residoAdminController goHome", error);
  }
};

//////////////////////////// SET DASHOARD ///////////////////
residoAdminController.getDashboard = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    const admin = req.session.member.memberName;
    console.log("welcome back to dashboard");
    res.send({
      message: `Welcome back ${admin}`,
    });
  } catch (error) {
    console.log("Error in dashboard page", error);
    res.redirect("/admin");
  }
};

/////////////////////////// GET LOGIN ///////////////////////
residoAdminController.getLogin = async function (req: Request, res: Response) {
  try {
    res.send("You have just logged in");
  } catch (error) {
    console.log("ERROR in residoAdminController getLogin: ", error);
  }
};

////////////////////////// PROCESS LOGIN ////////////////////
residoAdminController.processLogin = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("admin process login");
    const input = req.body;
    const result = await adminService.processLogin(input);

    //Session
    req.session.member = result;
    req.session.save(function () {
      res.redirect("/admin/dashboard");
    });
  } catch (error) {
    console.log("Error in admin login: ", error);
    const message =
      error instanceof Errors ? error.message : Message.SOMETHING_WENT_WRONG;

    res.send(`<script> alert("${message}"); window.location.replace("/admin/login")
        </script>`);
  }
};

////////////////////////// GET SINGUP ///////////////////////
residoAdminController.getSignup = async function (res: Response, req: Request) {
  try {
    res.send("You have just signed up");
  } catch (error) {
    console.log("ERROR in residoAdmin getSignup: ", error);
  }
};

///////////////////////// PROCESS SINGNUP ///////////////////
residoAdminController.processSignup = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("process signup for Admin");
    // const adminAvatar = req.files?.avatar;

    // if (!adminAvatar?.length) {
    //   throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
    // }

    const input = req.body;
    // input.avatar = orrangeFiles(adminAvatar)[0];
    input.role = MemberType.REAL_ESTATE_ADMIN;

    const result = await adminService.processSignup(input);

    req.session.member = result;
    req.session.save(function () {
      res.redirect("/admin/dashboard");
    });
  } catch (error) {
    console.log("Error in admin signup: ", error);
    const message =
      error instanceof Errors ? error.message : Message.SOMETHING_WENT_WRONG;
    res.send(`<script> alert("${message}"); window.location.replace("/admin/signup")
      </script>`);
  }
};

////////////////////////// ADD TARIFF///////////////////////
residoAdminController.addTarrif = async (req: Request, res: Response) => {
  try {
    const input: TarrifInputType = req.body;
    const result = await adminService.addTarrif(input);
    res.status(HttpCode.OK).json(result);
  } catch (error) {
    console.log("Error in addTarrif process: ", error);
    if (error instanceof Errors) {
      res.status(error.code).json(error);
    } else {
      res.status(Errors.standart.code).json(Errors.standart);
    }
  }
};

export default residoAdminController;
