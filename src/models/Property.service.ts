import {
  ChosenProperty,
  FeaturedPropertyInput,
  FeaturedPropertyResult,
  Properties,
  PropertyInput,
  PropertyUpdateInput,
  RecentPropertyForRent,
  RecentPropertyResult,
} from "../libs/types/property";
import PropertyModel, { Property } from "../schema/Property.model";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { PropertySortOrder, PropertyStatus } from "../libs/enums/property.enum";
import { CommonUsers, StatisticsModifier, T } from "../libs/types/common";
import {
  priceValueField,
  famousIndicatorField,
  commentLookup,
  addTotCommentsAvRatingFields,
  shapeIntoMongooseObjectId,
} from "../libs/config";
import { View, ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";
import { LikeInput } from "../libs/types/like";
import { LikeGroup } from "../libs/enums/like.enum";
import LikeService from "./Like.service";
import chalk from "chalk";
import { ObjectId } from "mongoose";
import likeTargetItem from "../libs/utils/likeTargetItem";

class PropertyService {
  private readonly propertyModel;
  public viewService;
  public likeService;

  constructor() {
    this.propertyModel = PropertyModel;
    this.viewService = new ViewService();
    this.likeService = new LikeService();
  }

  // UPDATE PROPERTY
  static async updatePropertyFields() {
    console.log(
      chalk.green("✅ Working with updatePropertyFields statis method")
    );
    const match: T = {
      status: PropertyStatus.AVAILABLE,
    };

    await PropertyModel.aggregate([
      {
        $match: match,
      },
      commentLookup,
      addTotCommentsAvRatingFields,

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
        $project: {
          comments: 0,
          daysSinceCreated: 0,
          recentBoost: 0,
        },
      },
      {
        $merge: {
          into: "properties",
          whenMatched: "merge",
          whenNotMatched: "discard",
        },
      },
    ]).exec();
  }

  // LIKE PROPERTY
  public async likeTargetProperty(
    userId: ObjectId,
    propertyId: ObjectId
  ): Promise<Property> {
    const target = await this.propertyModel
      .findOne({
        _id: propertyId,
        status: {
          $in: [
            PropertyStatus.AVAILABLE,
            PropertyStatus.RENTED,
            PropertyStatus.SOLD,
          ],
        },
      })
      .lean()
      .exec();

    if (!target) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    const input: LikeInput = {
      targetId: propertyId,
      userId: userId,
      likeGroup: LikeGroup.PROPERTY,
    };

    const modifier: number = await this.likeService.toggleLike(input);

    const result = await this.propertyStatsEditor({
      _id: propertyId,
      targetKey: "totalLikes",
      modifier,
    });

    if (!result) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
    }
    return result;
  }

  private async propertyStatsEditor(
    input: StatisticsModifier
  ): Promise<Property> {
    const { targetKey, _id, modifier } = input;

    const result = await this.propertyModel
      .findByIdAndUpdate(
        _id,
        {
          $inc: {
            [targetKey]: modifier,
          },
        },
        {
          new: true,
        }
      )
      .exec();

    return result as Property;
  }

  // CREATE PROPERTY
  public async createProperty(input: PropertyInput): Promise<Property> {
    try {
      const result = await this.propertyModel.create(input);
      return result;
    } catch (error) {
      console.log("Error: in createProduct Model ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  // UPDATE PROPERTY
  public async updateProperty(
    propertyId: ObjectId,
    input: PropertyUpdateInput
  ): Promise<Property> {
    const target = await this.propertyModel.findById(propertyId);

    if (!target) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    const result = await this.propertyModel.findByIdAndUpdate(
      propertyId,
      input,
      { new: true }
    );

    if (!result) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATING_FAILED);
    }
    return result;
  }

  // GET RECENT PROPERTY FOR RENT
  public async getRecentPropertiesForRent(
    input: RecentPropertyForRent
  ): Promise<RecentPropertyResult> {
    const { page, limit } = input;

    const match: T = {
      status: PropertyStatus.AVAILABLE,
      "sellingOption.optionRent.type": "RENT",
    };
    const sort: T = {
      createdAt: -1,
    };
    const [result] = await this.propertyModel.aggregate([
      {
        $match: match,
      },
      {
        $lookup: {
          from: "agents",
          let: {
            authorId: "$agentId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$authorId"],
                },
              },
            },
            {
              $project: { fullName: 1, rank: 1, _id: 1 },
            },
          ],
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      { $sort: sort },

      {
        $facet: {
          properties: [
            {
              $skip: (page - 1) * limit,
            },
            {
              $limit: limit,
            },
          ],
          totalPropertiesNumber: [
            {
              $count: "total",
            },
          ],
        },
      },
    ]);

    if (!result.properties.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result;
  }

  // GET FEATURED PROPERTY
  public async getFeaturedProperty(
    input: FeaturedPropertyInput
  ): Promise<FeaturedPropertyResult> {
    const match: T = {
      status: PropertyStatus.AVAILABLE,
      featuredScore: {
        $gte: 3,
      },
    };

    const { limit, page } = input;
    const sort: T = {
      featuredScore: -1,
    };
    const [result] = await this.propertyModel.aggregate([
      { $match: match },

      {
        $sort: sort,
      },
      {
        $facet: {
          properties: [
            { $skip: (page - 1) * limit },

            {
              $limit: limit,
            },
          ],
          totalPropertiesNumber: [
            {
              $count: "total",
            },
          ],
        },
      },
    ]);

    if (!result.properties.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result;
  }

  // GET ALL PROPERTIES
  public async getAllProperties(
    queries: T,
    member: CommonUsers | null
  ): Promise<Properties> {
    const match: T = {
      status: {
        $in: [
          PropertyStatus.AVAILABLE,
          PropertyStatus.RENTED,
          PropertyStatus.SOLD,
        ],
      },
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
    }

    this.shapeMatchQuery(match, queries);
    const pipeline: any[] = [
      { $match: match },
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
    ];

    if (queries.propertyVerified || queries.rank) {
      const filter: T = {};

      if (queries.propertyVerified) {
        filter["agentData.isVerified"] = queries.propertyVerified;
      }
      if (queries.rank) {
        filter["agentData.rank"] = queries.rank;
      }
      pipeline.push({
        $match: filter,
      });
    }
    pipeline.push(
      ...likeTargetItem(member?._id),
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
          totalPropertiesNumber: [{ $count: "total" }],
        },
      }
    );

    const [result] = await this.propertyModel.aggregate(pipeline);

    if (!result.properties.length) {
      return { properties: [], totalPropertiesNumber: [{ total: 0 }] };
    }
    return result;
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

  // GET A PROPERTY
  public async getProperty(
    memberId: ObjectId,
    productId: ObjectId
  ): Promise<ChosenProperty> {
    const match: T = {
      status: {
        $in: [
          PropertyStatus.AVAILABLE,
          PropertyStatus.RENTED,
          PropertyStatus.SOLD,
        ],
      },
    };

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

        await this.propertyStatsEditor({
          _id: productId,
          targetKey: "views",
          modifier: 1,
        });
      }
    }

    let [result] = await this.propertyModel.aggregate([
      {
        $facet: {
          mainProperty: [
            {
              $match: { ...match, _id: productId },
            },
            {
              $lookup: {
                from: "likes",
                let: {
                  targetId: "$_id",
                  userId: shapeIntoMongooseObjectId(memberId),
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$targetId", "$$targetId"],
                          },
                          {
                            $eq: ["$userId", "$$userId"],
                          },
                        ],
                      },
                    },
                  },
                ],
                as: "meLiked",
              },
            },
            {
              $addFields: {
                meLiked: {
                  $cond: [{ $gt: [{ $size: "$meLiked" }, 0] }, true, false],
                },
              },
            },
            {
              $lookup: {
                from: "agents",
                foreignField: "_id",
                localField: "agentId",
                as: "agentData",
              },
            },
            { $unwind: "$agentData" },
            priceValueField,
          ],
          trendingProperties: [
            {
              $match: {
                ...match,
                featuredScore: {
                  $gte: 3,
                },
              },
            },
            { $sort: { featuredScore: -1, createdAt: -1 } },
            { $limit: 6 },
          ],
        },
      },
    ]);

    if (!result.mainProperty.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return result;
  }
}
export default PropertyService;
