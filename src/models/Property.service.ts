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
import {
  PropertySortOrder,
  PropertyStatus,
  SellingTypeEnum,
} from "../libs/enums/property.enum";
import {
  CommonPageInput,
  CommonUsers,
  StatisticsModifier,
  T,
} from "../libs/types/common";
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
import { SavingInput } from "../libs/types/userSaving";
import UserSaving from "./UserSaving.service";
import generateMeSavedKey from "../libs/utils/generatedMeSavedKey";
import { TargetGroup } from "../libs/enums/userSaving.enum";
import UserSavingModel, { SavingOutput } from "../schema/UserSaving.model";
import MemberService from "./Member.service";
import { Agent } from "../libs/types/agent";
import { geocodeAddress } from "../libs/utils/figureGeoPosition";
import mongoose from "mongoose";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import { AgencyStatus, SubscriptionStatus } from "../libs/enums/agency.enum";
import AgencyModel from "../schema/members/Agency.model";
import AgencySubscriptionModel from "../schema/AgencySubscription.model";
import AgentModel from "../schema/members/Agent.model";
import { AgentStatus } from "../libs/enums/agent.enum";

class PropertyService {
  private readonly propertyModel;
  public viewService;
  public likeService;
  public saveService;
  private readonly saveModel;
  public memberService;
  private readonly agencyModel;
  private readonly agentModel;
  private readonly subscriptionModel;

  constructor() {
    this.propertyModel = PropertyModel;
    this.viewService = new ViewService();
    this.likeService = new LikeService();
    this.saveService = new UserSaving();
    this.saveModel = UserSavingModel;
    this.memberService = new MemberService();
    this.agencyModel = AgencyModel;
    this.agentModel = AgentModel;
    this.subscriptionModel = AgencySubscriptionModel;
  }

  // UPDATE PROPERTY
  static async updatePropertyFields() {
    console.log(
      chalk.green("✅ Working with updatePropertyFields static method"),
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
          daysSinceCreated: {
            $floor: {
              $divide: [
                { $subtract: ["$$NOW", "$createdAt"] },
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
    propertyId: ObjectId,
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
    input: StatisticsModifier,
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
        },
      )
      .exec();

    return result as Property;
  }

  // CREATE PROPERTY
  public async createProperty(
    input: PropertyInput,
    member: CommonUsers,
  ): Promise<Property> {
    // Get agent  full agent data, partial one is not enough and agent is be gonna checked in getMemberData, whether agent is found or not
    const agent = (await this.memberService.getMemberData(
      member.role,
      member._id!,
    )) as Agent;

    // Get GeoCode data, all possiblities are gonna be checked in the method itself
    const { street, city, country } = input.address;
    const address = [street, city, country].filter(Boolean).join(", ");
    const geoCode = await geocodeAddress(address);
    // Subscrition activeness check
    const subscriptionMatch: T = {
      agencyId: agent.agencyId,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    };

    const subscription = await this.subscriptionModel
      .findOne(subscriptionMatch)
      .lean()
      .exec();

    if (!subscription) {
      throw new Errors(HttpCode.FORBIDDEN, Message.NO_ACTIVE_SUBSCRIPTION);
    }

    if (
      subscription.billingSnapshot.usage.properties >=
      subscription.billingSnapshot.limit.properties
    ) {
      throw new Errors(HttpCode.FORBIDDEN, Message.EXCEED_LIMIT);
    }

    try {
      // Property creation
      const result = await this.propertyModel.create({
        ...input,
        address: {
          ...input.address,
          geoCode,
        },
        agentId: agent._id,
        agencyId: agent.agencyId,
      });

      return result;
    } catch (error) {
      console.log("Error: in createProduct Model ", error);

      if (error instanceof Errors) {
        throw error;
      } else {
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
      }
    }
  }

  // UPDATE PROPERTY
  public async updateProperty(
    propertyId: ObjectId,
    input: PropertyUpdateInput,
  ): Promise<Property> {
    const propertyMatch: T = {
      _id: propertyId,
    };
    const result = await this.propertyModel.findOneAndUpdate(
      propertyMatch,
      {
        $set: input,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!result) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATING_FAILED);
    }

    return result;
  }

  // GET RECENT PROPERTY FOR RENT
  public async getRecentPropertiesForRent(
    input: RecentPropertyForRent,
  ): Promise<RecentPropertyResult> {
    const { page, limit } = input;

    const match: T = {
      status: PropertyStatus.AVAILABLE,
      "sellingOption.optionRent.type": SellingTypeEnum.RENT,
    };

    const sort: T = {
      createdAt: -1,
    };

    const [result] = await this.propertyModel.aggregate([
      {
        $match: match,
      },
      { $sort: sort },
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
      return {
        properties: result.properites || [],
        totalPropertiesNumber: result.totalPropertiesNumber || [{ total: 0 }],
      };
    }
    return result;
  }

  // GET FEATURED PROPERTY
  public async getFeaturedProperty(
    input: FeaturedPropertyInput,
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
      return { properties: [], totalPropertiesNumber: [{ total: 0 }] };
    }
    return result;
  }

  // GET ALL PROPERTIES
  public async getAllProperties(
    queries: T,
    member: CommonUsers | null,
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
          pipeline: [{ $project: { fullName: 1, rank: 1, isVerified: 1 } }],
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
      },
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
      match.$or = [
        { "address.city": { $regex: address, $options: "i" } },
        { "address.street": { $regex: address, $options: "i" } },
        { "address.country": { $regex: address, $options: "i" } },
        { "address.district": { $regex: address, $options: "i" } },
      ];
    }

    if (propertyType) {
      match.propertyType = { $regex: propertyType, $options: "i" };
    }
    if (bedrooms) {
      match.bedrooms = bedrooms >= 6 ? { $gte: bedrooms } : bedrooms;
    }

    if (mood) {
      match.mood = { $regex: mood, $options: "i" };
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
    productId: ObjectId,
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

      const existView: View | null =
        await this.viewService.checkViewExistance(input);

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
            ...generateMeSavedKey(shapeIntoMongooseObjectId(memberId)),
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

  // GET A PUBLISHER PROPERTY
  public async getPublisherProperty(
    member: CommonUsers,
    propertyId: ObjectId,
  ): Promise<Property> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    const match: T = {
      status: {
        $ne: PropertyStatus.DELETED,
      },
      _id: propertyId,
    };

    if (member.role === MemberType.AGENT) {
      match.agentId = memberId;
    }

    if (member.role === MemberType.AGENCY) {
      match.agencyId = memberId;
    }

    const result = await this.propertyModel.findOne(match).lean().exec();

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return result;
  }

  // SAVE TARGET PROPERTY
  public async toggleSaveProperty(
    propertyId: ObjectId,
    query: SavingInput,
  ): Promise<Property> {
    const match: T = {
      status: {
        $in: [
          PropertyStatus.AVAILABLE,
          PropertyStatus.RENTED,
          PropertyStatus.SOLD,
        ],
      },
      _id: propertyId,
    };

    const target = await this.propertyModel.findOne(match);

    if (!target) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    const modifier = <number>await this.saveService.toggleSave(query);

    const result = await this.propertyStatsEditor({
      _id: target._id,
      modifier,
      targetKey: "totalSavings",
    });

    return result;
  }

  // GET SAVED PROPERTIES
  public async getSavedProperties(
    user: CommonUsers,
    query: CommonPageInput,
  ): Promise<Properties> {
    const { limit, page } = query;
    const match: T = {
      userId: shapeIntoMongooseObjectId(user._id),
      targetGroup: TargetGroup.PROPERTY,
    };
    const sort: T = {
      createdAt: -1,
    };

    const [result] = await this.saveModel.aggregate([
      {
        $match: match,
      },
      {
        $sort: sort,
      },
      {
        $facet: {
          items: [
            {
              $skip: (page - 1) * limit,
            },
            { $limit: limit },
            {
              $lookup: {
                from: "properties",
                localField: "targetId",
                foreignField: "_id",
                as: "property",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      title: 1,
                      address: 1,
                      sellingOption: 1,
                      images: 1,
                      createdAt: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$property",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $replaceRoot: {
                newRoot: "$property",
              },
            },
          ],
          totalPropertiesNumber: [{ $count: "total" }],
        },
      },
    ]);

    return {
      properties: result?.items ?? [],
      totalPropertiesNumber: result.totalPropertiesNumber,
    };
  }
}
export default PropertyService;
