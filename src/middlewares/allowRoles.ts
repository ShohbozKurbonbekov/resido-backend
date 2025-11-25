import { NextFunction, RequestHandler, Response } from "express";
import { MemberType } from "../libs/enums/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ExtendedRequest } from "../libs/types/user";

export const allowRoles = (
  message = Message.ONLY_AGENCY_ADMIN_AGENT,
  ...roles: MemberType[]
): RequestHandler => {
  const middleware = (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const role = req.member?.role; // admin - agency - agent

      if (role && roles.includes(role)) return next();

      throw new Errors(HttpCode.UNAUTHORIZED, message);
    } catch (error) {
      console.log("Error in allowRoles: ", error);
      if (error instanceof Errors) {
        res.status(error.code).json(error);
      } else {
        res.status(Errors.standart.code).json(Errors.standart);
      }
    }
  };

  return middleware as RequestHandler;
};
