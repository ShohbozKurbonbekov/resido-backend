import {
  Properties,
  Property,
  PropertyDocument,
  PropertyInput,
  PropertyInquery,
  RecentPropertyForRent,
  RecentPropertyResult,
} from "../libs/types/property";
import PropertyModel from "../schema/Property.model";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { PropertySortOrder, PropertyStatus } from "../libs/enums/property.enum";
import { T } from "../libs/types/common";
import { text } from "stream/consumers";
import { priceValueField, famousIndicatorField } from "../libs/config";
import { ObjectId } from "mongoose";
import { View, ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";
class PropertyService {
  private readonly propertyModel;
  public viewService;

  constructor() {
    this.propertyModel = PropertyModel;
    this.viewService = new ViewService();
  }

  // CREATE PROPERTY
  public async createProperty(input: PropertyInput): Promise<PropertyDocument> {
    try {
      const result = await this.propertyModel.create(input);
      return result;
    } catch (error) {
      console.log("Error: in createProduct Model ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  // GET RECENT PROPERTY FOR RENT
  public async getRecentPropertiesForRent(
    input: RecentPropertyForRent
  ): Promise<RecentPropertyResult> {
    const [properties, totalPropertiesNumber]: any[] = await Promise.all([
      this.propertyModel
        .find({ "sellingOption.optionRent.type": "RENT" })
        .sort({
          createdAt: -1,
        })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean()
        .exec(),
      this.propertyModel
        .countDocuments({
          "sellingOption.optionRent.type": "RENT",
        })
        .lean()
        .exec(),
    ]);
    if (!properties.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return { properties, totalPropertiesNumber };
  }

  // GET FEATURED PROPERTY
  public async getFeaturedProperty(
    input: RecentPropertyForRent
  ): Promise<RecentPropertyResult> {
    const [properties, totalPropertiesNumber] = await Promise.all([
      this.propertyModel
        .find({
          status: PropertyStatus.AVAILABLE,
          featuredScore: {
            $gte: 0.5,
          },
        })
        .sort({
          featuredScore: -1,
        })
        .skip((input.page - 1) * input.limit)
        .limit(input.limit)
        .lean()
        .exec(),
      this.propertyModel
        .countDocuments({
          status: PropertyStatus.AVAILABLE,
          featuredScore: {
            $gte: 0.5,
          },
        })
        .exec(),
    ]);

    if (!properties.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return {
      properties,
      totalPropertiesNumber,
    };
  }

  // GET ALL PROPERTIES
  public async getAllProperties(queries: T): Promise<Properties> {
    const match: T = {
      status: PropertyStatus.AVAILABLE,
    };

    const sort: T = {};

    if (queries?.order === PropertySortOrder.LOW_PRICE) {
      sort.priceValue = 1;
    }
    if (queries?.order === PropertySortOrder.HIGH_PRICE) {
      sort.priceValue = -1;
    }
    if (queries?.order === PropertySortOrder.MOST_FAMOUS) {
      sort.famousIndicator = -1;
      sort.createdAt = -1;
    }

    this.shapeMatchQuery(match, queries);

    const pipeline: any[] = [{ $match: match }];

    if (Object.keys(match).length > 1) {
      pipeline.push(
        {
          $lookup: {
            from: "agents",
            localField: "agentId",
            foreignField: "_id",
            as: "agentData",
            pipeline: [{ $project: { name: 1, rank: 1, isVerified: 1 } }],
          },
        },
        { $unwind: "$agentData" },
        {
          $match: {
            "agentData.isVerified": queries.propertyVerified,
            "agentData.rank": queries.rank,
          },
        }
      );
    }

    pipeline.push(
      priceValueField,
      famousIndicatorField,
      { $sort: sort },
      {
        $facet: {
          properties: [
            {
              $skip: (queries.page - 1) * queries.limit,
            },
            { $limit: queries.limit },
          ],
          metaCounter: [{ $count: "total" }],
        },
      }
    );
    const result = await this.propertyModel.aggregate(pipeline);

    if (!result[0].properties.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result[0];
  }

  // SHAPE THE QUERY
  private shapeMatchQuery(match: T, queries: T): void {
    const { amenities, bedrooms, address, mood, price, title, propertyType } =
      queries;

    if (title) {
      match.title = { $regex: new RegExp(title, "i") };
    }
    if (address) {
      match["address.city"] = { $regex: new RegExp(address, "i") };
    }
    if (propertyType) {
      match.propertyType = {
        $regex: new RegExp(propertyType, "i"),
      };
    }
    if (bedrooms) {
      match.bedrooms = bedrooms >= 6 ? { $gte: bedrooms } : bedrooms;
    }

    if (mood) {
      match.mood = { $regex: new RegExp(mood, "i") };
    }
    if (price) {
      const { start, end } = price;
      match.$or = [
        { "sellingOption.optionSell.overalAmunt": { $gte: start, $lte: end } },
        {
          "sellingOption.optionRent.overalAmount": { $gte: start, $lte: end },
        },
      ];
    }
    if (amenities) {
      match.$and = Object.entries(amenities)
        .filter(([_, value]) => value)
        .map(([key, value]) => ({ [`amenities.${key}`]: value }));
    }
  }

  public async getProduct(
    memberId: ObjectId,
    productId: ObjectId
  ): Promise<PropertyDocument> {
    const match = {
      _id: productId,
      status: PropertyStatus.AVAILABLE,
    };
    await this.propertyModel
      .aggregate([
        {
          $match: match,
        },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "targetId",
            as: "comments",
          },
        },
        {
          $addFields: {
            totalComments: {
              $size: {
                $ifNull: [
                  { $cond: [{ $isArray: "$comments" }, "$comments", []] },
                  [],
                ],
              },
            },
            averageRating: {
              $avg: "$comments.rating",
            },
          },
        },
        {
          $addFields: {
            totalLikes: {
              $ifNull: ["$totalLikes", 0],
            },
            daysSinceCreated: {
              $floor: {
                $divide: [
                  { $subtract: [new Date(), "$createdAt"] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
        },

        {
          $addFields: {
            recentBoost: {
              $cond: [{ $lte: ["$daysSinceCreated", 7] }, 1, 0],
            },
            featuredScore: {
              $add: [
                {
                  $multiply: [{ $ifNull: ["$averageRating", 0] }, 0.4],
                },
                {
                  $multiply: [
                    { $ln: { $add: [{ $ifNull: ["$totalComments", 0] }, 1] } },
                    0.25,
                  ],
                },
                {
                  $multiply: [
                    { $ln: { $add: [{ $ifNull: ["$views", 0] }, 1] } },
                    0.2,
                  ],
                },
                {
                  $multiply: [
                    { $ln: { $add: [{ $ifNull: ["$totalLikes", 0] }, 1] } },
                    0.1,
                  ],
                },
                {
                  $multiply: [{ $ifNull: ["$recentBoost", 0] }, 0.05],
                },
              ],
            },
          },
        },
        {
          $merge: {
            into: "properties",
            whenMatched: "merge",
            whenNotMatched: "discard",
          },
        },
      ])
      .exec();

    let result = await this.propertyModel.findOne({
      ...match,
    });

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    if (memberId) {
      const input: ViewInput = {
        viewTargetId: productId,
        userId: memberId,
        viewGroup: ViewGroup.PROPERTY,
      };

      const existView: View | null = await this.viewService.checkViewExistance(
        input
      );

      if (!existView) {
        await this.viewService.insertUserView(input);

        result = await this.propertyModel
          .findOneAndUpdate(
            { _id: productId },
            {
              $inc: { views: +1 },
            },
            {
              new: true,
            }
          )
          .exec();
      }
    }

    return result as PropertyDocument;
  }
}
export default PropertyService;
