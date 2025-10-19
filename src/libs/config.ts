import mongoose from "mongoose";
import { MemberType } from "./enums/member.enum";
import { ExtendedRequest } from "./types/user";
import { NextFunction, RequestHandler, Response } from "express";
import Errors, { HttpCode, Message } from "./Errors";
import chalk from "chalk";

export const MORGAN_FORMAT = chalk.bgGreen(
  `:method :url :response-time [:status] \n`
);
export const jwtTime = 6;

export const shapeIntoMongooseObjectId = (target: any) => {
  return typeof target === "string"
    ? new mongoose.Types.ObjectId(target)
    : target;
};

export const priceValueField = {
  $addFields: {
    priceValue: {
      $ifNull: [
        "$sellingOption.optionRent.overalAmount",
        "$sellingOption.optionSell.overalAmunt",
      ],
    },
  },
};

export const famousIndicatorField = {
  $addFields: {
    famousIndicator: {
      $add: [
        { $multiply: [{ $ifNull: ["$averageRating", 0] }, 0.4] },
        {
          $multiply: [{ $ln: { $add: ["$totalLikes", 1] } }, 0.3],
        },
        {
          $multiply: [{ $ln: { $add: ["$totalComments", 1] } }, 0.2],
        },
        { $multiply: [{ $ln: { $add: ["$views", 1] } }, 0.1] },
      ],
    },
  },
};

export const commentLookup = {
  $lookup: {
    from: "comments",
    localField: "_id",
    foreignField: "targetId",
    as: "comments",
  },
};

export const addTotCommentsAvRatingFields = {
  $addFields: {
    totalComments: {
      $size: {
        $ifNull: ["$comments", []],
      },
    },
    averageRating: {
      $avg: {
        $map: {
          input: "$comments",
          as: "c",
          in: { $ifNull: ["$$c.rating", 0] },
        },
      },
    },
  },
};

export const agentsLookupByAgencyId = {
  $lookup: {
    from: "agents",
    foreignField: "agencyId",
    localField: "_id",
    as: "agentsList",
  },
};

export const propertiesLookupByAgencyId = {
  $lookup: {
    from: "properties",
    foreignField: "agencyId",
    localField: "_id",
    as: "propertiesList",
  },
};

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
