import mongoose from "mongoose";
import { T } from "./types/common";

export const MORGAN_FORMAT = `:method :url :response-time [:status] \n`;
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
        $ifNull: [{ $cond: [{ $isArray: "$comments" }, "$comments", []] }, []],
      },
    },
    averageRating: {
      $avg: "$comments.rating",
    },
  },
};
