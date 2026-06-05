import mongoose from "mongoose";
import chalk from "chalk";

// MORGAN SETUP
export const MORGAN_FORMAT = chalk.bgGreen(
  `:method :url :response-time [:status] \n`,
);

// AGENDA CONFIG

export const agendaConfig = {
  mongoUri: process.env.MONGO_URL as string,
  agendaCollectionName: "agendaJobs",
  cron: "40 0 * * *",
};
export const jwtTime = 6;

// CHANGE INTO DB ID
export const shapeIntoMongooseObjectId = (target: any) => {
  return typeof target === "string"
    ? new mongoose.Types.ObjectId(target)
    : target;
};

///////////////// LOOKUPS /////////////////
export const priceValueField = {
  $addFields: {
    priceValue: {
      $toDouble: {
        $ifNull: [
          "$sellingOption.optionRent.overalAmount",
          "$sellingOption.optionSell.overalAmunt",
        ],
      },
    },
  },
};

export const propertyListingType = {
  $addFields: {
    propertyListingType: {
      $ifNull: [
        "$sellingOption.optionRent.type",
        "$sellingOption.optionSell.type",
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
          $multiply: [
            { $ln: { $add: [{ $ifNull: ["$totalLikes", 0] }, 1] } },
            0.3,
          ],
        },
        {
          $multiply: [
            { $ln: { $add: [{ $ifNull: ["$totalComments", 0] }, 1] } },
            0.2,
          ],
        },
        {
          $multiply: [{ $ln: { $add: [{ $ifNull: ["$views", 0] }, 1] } }, 0.1],
        },
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

export const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
