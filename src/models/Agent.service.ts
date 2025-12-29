import {
  Agent,
  AgentDetailType,
  AgentInputUpdate,
  AgentPropertiesInput,
  AgentResults,
  FeaturedAgentsInput,
  FeaturedAgentsResult,
  MemberAgentInput,
  SearchByLocationInput,
  SearchByLocationResult,
} from "../libs/types/agent";
import AgentModel from "../schema/members/Agent.model";
import {
  CommonPageInput,
  CommonUsers,
  StatisticsModifier,
  T,
} from "../libs/types/common";
import { MemberStatus } from "../libs/enums/member.enum";
import Errors, { HttpCode } from "../libs/Errors";
import { Message } from "../libs/Errors";
import { ObjectId } from "mongoose";
import {
  addTotCommentsAvRatingFields,
  commentLookup,
  shapeIntoMongooseObjectId,
} from "../libs/config";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";
import { ViewDocs } from "../schema/View.model";
import { LikeInput } from "../libs/types/like";
import { LikeGroup } from "../libs/enums/like.enum";
import LikeService from "./Like.service";
import { AgentPropertyType, AgentStatus } from "../libs/enums/agent.enum";
import { PropertyStatus } from "../libs/enums/property.enum";
import { SavingInput } from "../libs/types/userSaving";
import UserSaving from "./UserSaving.service";
import generateMeSavedKey from "../libs/utils/generatedMeSavedKey";
import { TargetGroup } from "../libs/enums/userSaving.enum";
import UserSavingModel, { SavingOutput } from "../schema/UserSaving.model";
import { User } from "../libs/types/user";
import UserModel from "../schema/members/User.model";
import { Blogs } from "../libs/types/blog";
import { BlogAuthorType, BlogStatus } from "../libs/enums/blog.enum";
import BlogModel, { BlogDoc } from "../schema/Blog.model";
import { Comments, CommentsSearchInput } from "../libs/types/comment";
import { CommentStatus, CommentTargetType } from "../libs/enums/comment.enum";
import CommentModel from "../schema/Comment.model";
import { OrderRender } from "../libs/enums/common.enum";

class AgentService {
  private readonly agentModel;
  public readonly viewService;
  public readonly likeService;
  public readonly saveService;
  public readonly saveModel;
  public readonly userModel;
  private readonly blogModel;
  private readonly commentModel;

  constructor() {
    this.agentModel = AgentModel;
    this.viewService = new ViewService();
    this.likeService = new LikeService();
    this.saveService = new UserSaving();
    this.saveModel = UserSavingModel;
    this.userModel = UserModel;
    this.blogModel = BlogModel;
    this.commentModel = CommentModel;
  }

  // UPDATE AGENT FIELDS
  static async updateAgentFields() {
    const match: T = {
      memberStatus: MemberStatus.ACTIVE,
    };

    await AgentModel.aggregate([
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
          featuredScore: {
            $add: [
              {
                $multiply: [{ $ifNull: ["$averageRating", 0] }, 0.4],
              },
              {
                $multiply: [
                  { $ln: { $add: [{ $ifNull: ["$points", 0] }, 1] } },
                  0.25,
                ],
              },
              {
                $multiply: [
                  { $ln: { $add: [{ $ifNull: ["$totalLikes", 0] }, 1] } },
                  0.2,
                ],
              },
              {
                $multiply: [
                  { $ln: { $add: [{ $ifNull: ["$totalComments", 0] }, 1] } },
                  0.1,
                ],
              },
              {
                $multiply: [
                  { $ln: { $add: [{ $ifNull: ["$views", 0] }, 1] } },
                  0.05,
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          rank: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      {
                        $gte: ["$featuredScore", 8],
                      },
                      {
                        $eq: ["$isVerified", true],
                      },
                    ],
                  },
                  then: "superAgent",
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$featuredScore", 5] },
                      {
                        $eq: ["$isVerified", true],
                      },
                    ],
                  },
                  then: "trustedAgent",
                },
              ],
              default: "regularAgent",
            },
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
          into: "agents",
          whenMatched: "merge",
          whenNotMatched: "discard",
        },
      },
    ]);
  }

  // GET AGENTS BY LOCATION
  public async getAgentByLocation(
    input: SearchByLocationInput
  ): Promise<SearchByLocationResult> {
    const { limit, page } = input;
    const match: T = {
      memberStatus: MemberStatus.ACTIVE,
      currentStatus: AgentStatus.AVAILABLE,
    };

    if (input.location) {
      match.address = { $regex: input.location, $options: "i" };
    }

    const sort: T = {
      featuredScore: -1,
      isVerified: -1,
    };

    const [result] = await this.agentModel.aggregate([
      {
        $match: match,
      },
      { $sort: sort },
      {
        $facet: {
          agents: [
            {
              $skip: (page - 1) * limit,
            },
            { $limit: limit },
          ],
          totalNumbers: [{ $count: "total" }],
        },
      },
    ]);

    if (!result.agents.length) {
      return { agents: [], totalNumbers: [{ total: 0 }] };
    }

    return result;
  }

  // GET AGENT DETAIL
  public async getAgentDetail(
    agentId: ObjectId,
    member: CommonUsers
  ): Promise<AgentDetailType> {
    const match: T = {
      _id: agentId,
      memberStatus: MemberStatus.ACTIVE,
      currentStatus: AgentStatus.AVAILABLE,
    };

    const target = await this.agentModel.findOne(match);

    if (!target) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    if (member) {
      const input: ViewInput = {
        userId: member._id!,
        viewGroup: ViewGroup.AGENT,
        viewTargetId: agentId,
      };

      const exist: null | ViewDocs = await this.viewService.checkViewExistance(
        input
      );

      if (!exist) {
        await this.viewService.insertUserView(input);

        await this.agentStatsEditor({
          _id: agentId,
          targetKey: "views",
          modifier: 1,
        });
      }
    }

    let result = await this.agentModel.aggregate([
      { $match: match },
      ...generateMeSavedKey(shapeIntoMongooseObjectId(member?._id)),
      {
        $lookup: {
          from: "properties",
          localField: "_id",
          foreignField: "agentId",
          as: "allProperties",
        },
      },
      {
        $addFields: {
          totalProperties: {
            $size: {
              $ifNull: ["$allProperties", []],
            },
          },
        },
      },
      commentLookup,
      {
        $addFields: {
          totalComments: {
            $size: {
              $ifNull: ["$comments", []],
            },
          },
        },
      },
      {
        $addFields: {
          properties: {
            sale: {
              $filter: {
                input: "$allProperties",
                as: "prop",
                cond: {
                  $eq: [
                    {
                      $ifNull: ["$$prop.sellingOption.optionSell.type", ""],
                    },
                    "SALE",
                  ],
                },
              },
            },
            rent: {
              $filter: {
                input: "$allProperties",
                as: "prop",
                cond: {
                  $eq: [
                    {
                      $ifNull: ["$$prop.sellingOption.optionRent.type", ""],
                    },
                    "RENT",
                  ],
                },
              },
            },
          },
        },
      },
      {
        $project: {
          allProperties: 0,
        },
      },
    ]);

    if (!result.length) {
      return { agent: [] };
    }

    return { agent: result };
  }

  // UPDATE AGENT STATISTICS
  private async agentStatsEditor(input: StatisticsModifier): Promise<Agent> {
    const { targetKey, _id, modifier } = input;

    const result = await this.agentModel
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

    return result as Agent;
  }

  // LIKE AN AGENT
  public async likeTargetAgent(
    userId: ObjectId,
    agentId: ObjectId
  ): Promise<Agent> {
    const match: T = {
      _id: agentId,
      memberStatus: MemberStatus.ACTIVE,
    };

    const target = await this.agentModel.findOne(match);

    if (!target) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    const input: LikeInput = {
      targetId: agentId,
      likeGroup: LikeGroup.AGENT,
      userId,
    };

    const modifier: number = await this.likeService.toggleLike(input);

    const result = this.agentStatsEditor({
      _id: agentId,
      targetKey: "totalLikes",
      modifier,
    });

    return result;
  }

  // SAVE TARGET BLOG
  public async saveToggleAgent(
    agentId: ObjectId,
    query: SavingInput
  ): Promise<Agent> {
    const match: T = {
      currentStatus: AgentStatus.AVAILABLE,
      memberStatus: MemberStatus.ACTIVE,
      _id: agentId,
    };

    const target = await this.agentModel.findOne(match);
    if (!target) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    const modifier = <number>await this.saveService.toggleSave(query);

    const result = await this.agentStatsEditor({
      _id: target._id,
      modifier,
      targetKey: "totalSavings",
    });

    return result;
  }

  // GET FOLLOWED AGENTS
  public async getFollowedAgents(
    user: CommonUsers,
    query: CommonPageInput
  ): Promise<AgentResults> {
    const { limit, page } = query;
    const match: T = {
      userId: shapeIntoMongooseObjectId(user._id),
      targetGroup: TargetGroup.AGENT,
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
                from: "agents",
                localField: "targetId",
                foreignField: "_id",
                as: "agent",
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      agencyId: 1,
                      nickname: 1,
                      fullName: 1,
                      averageRating: 1,
                      totalSavings: 1,
                      avatar: 1,
                      createdAt: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$agent",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $replaceRoot: {
                newRoot: "$agent",
              },
            },
            {
              $lookup: {
                from: "properties",
                let: {
                  agentId: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$agentId", "$$agentId"],
                      },
                    },
                  },
                  {
                    $count: "count",
                  },
                ],
                as: "overalProperties",
              },
            },
            {
              $lookup: {
                from: "agencies",
                localField: "agencyId",
                foreignField: "_id",
                as: "agency",
                pipeline: [
                  {
                    $project: {
                      memberName: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$agency",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                propertiesNumber: {
                  $ifNull: [
                    { $arrayElemAt: ["$overalProperties.count", 0] },
                    0,
                  ],
                },
                agencyName: "$agency.memberName",
              },
            },

            {
              $project: {
                overalProperties: 0,
                agency: 0,
              },
            },
          ],
          totalNumbers: [{ $count: "total" }],
        },
      },
    ]);

    return {
      agents: result?.items ?? [],
      totalNumbers: result?.totalNumbers,
    };
  }

  // GET FEATURED AGENTS
  public async getFeaturedAgents(
    input: FeaturedAgentsInput
  ): Promise<FeaturedAgentsResult> {
    const { page, limit } = input;
    const match: T = {
      currentStatus: AgentStatus.AVAILABLE,
      memberStatus: MemberStatus.ACTIVE,
      featuredScore: { $gte: 5 },
    };

    const sort: T = {
      featuredScore: -1,
    };

    const [result] = await this.agentModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "properties",
          localField: "_id",
          foreignField: "agentId",
          as: "comments",
        },
      },
      {
        $addFields: {
          totalProperties: {
            $size: {
              $ifNull: ["$comments", []],
            },
          },
        },
      },
      {
        $project: {
          comments: 0,
        },
      },
      {
        $sort: sort,
      },
      {
        $facet: {
          agents: [
            {
              $skip: (page - 1) * limit,
            },
            { $limit: limit },
          ],
          totalNumbers: [{ $count: "total" }],
        },
      },
    ]);

    if (!result.agents.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return result;
  }

  // GET AGENT PROPERTIES
  public async getAgentProperties(
    agentId: ObjectId,
    input: AgentPropertiesInput
  ): Promise<AgentDetailType> {
    const match: T = {
      currentStatus: AgentStatus.AVAILABLE,
      memberStatus: MemberStatus.ACTIVE,
      _id: agentId,
    };
    const target = await this.agentModel.findOne(match);

    if (!target) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    const propertyFilter: T = {
      status: {
        $in: [
          PropertyStatus.AVAILABLE,
          PropertyStatus.RENTED,
          PropertyStatus.SOLD,
        ],
      },
    };

    if (input?.agentPropertyType) {
      if (input.agentPropertyType === AgentPropertyType.RENT) {
        propertyFilter["sellingOption.optionRent.type"] =
          AgentPropertyType.RENT;
      }

      if (input?.agentPropertyType === AgentPropertyType.SALE) {
        propertyFilter["sellingOption.optionSell.type"] =
          AgentPropertyType.SALE;
      }
    }

    if (input.searchLocation) {
      propertyFilter.$or = [
        { "address.street": { $regex: input.searchLocation, $options: "i" } },
        {
          "address.district": { $regex: input.searchLocation, $options: "i" },
        },
        {
          "address.city": { $regex: input.searchLocation, $options: "i" },
        },
        { "address.country": { $regex: input.searchLocation, $options: "i" } },
      ];
    }
    const sort: T = {
      createdAt: -1,
    };
    const result = await this.agentModel.aggregate([
      {
        $match: match,
      },
      {
        $lookup: {
          from: "properties",
          let: {
            agentId: "$_id",
          },
          as: "agentProperties",
          pipeline: [
            {
              $facet: {
                limitedProperties: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$agentId", "$$agentId"],
                      },
                      ...propertyFilter,
                    },
                  },
                  { $sort: sort },
                  {
                    $skip: (input.page - 1) * input.limit,
                  },
                  { $limit: input.limit },
                ],
                overalProperties: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$agentId", "$$agentId"],
                      },
                      ...propertyFilter,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      { $unwind: "$agentProperties" },
      {
        $addFields: {
          limitedProperties: {
            $ifNull: ["$agentProperties.limitedProperties", []],
          },
          totalProperties: {
            $size: {
              $ifNull: ["$agentProperties.overalProperties", []],
            },
          },
        },
      },
      {
        $project: {
          agentProperties: 0,
        },
      },
    ]);

    return { agent: result };
  }

  // AGENT APPLY
  public async agentApply(
    input: MemberAgentInput,
    member: User
  ): Promise<Agent> {
    const _id = shapeIntoMongooseObjectId(member._id);
    const target = await this.agentModel
      .findOne({ userId: _id })
      .select("memberPassword _id memberEmail");

    if (target) {
      throw new Errors(HttpCode.CONFLICT, Message.AGENT_EXISTS);
    }
    console.log(member);
    try {
      const agent = await this.agentModel.create({
        ...input,
        userId: member._id,
      });

      return agent;
    } catch (error) {
      console.log("Error in agentApply service: ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  // AGENT CHANGE
  public async updateAgentProfile(
    input: AgentInputUpdate,
    memberId: ObjectId
  ): Promise<Agent> {
    const result = await this.agentModel
      .findByIdAndUpdate({ _id: memberId }, input, { new: true })
      .lean()
      .exec();

    if (!result) {
      throw new Errors(HttpCode.NOT_MODIFIELD, Message.UPDATING_FAILED);
    }

    return result;
  }

  // AGENT MY BLOGS
  public async myBlogs(
    member: CommonUsers,
    query: CommonPageInput
  ): Promise<Blogs> {
    const { page, limit } = query;
    const match: T = {
      blogAuthorId: shapeIntoMongooseObjectId(member._id),
      blogAuthorType: BlogAuthorType.AGENT,
      blogStatus: BlogStatus.ACTIVE,
    };

    const sort: T = {
      createdAt: -1,
    };

    const [result] = await this.blogModel.aggregate([
      {
        $match: match,
      },
      {
        $sort: sort,
      },
      {
        $facet: {
          blogs: [
            {
              $skip: (page - 1) * limit,
            },
            {
              $limit: limit,
            },
          ],
          totalBlogsNumber: [{ $count: "total" }],
        },
      },
    ]);

    if (!result.blogs.length) {
      return { blogs: [], totalBlogsNumber: [{ total: 0 }] };
    }
    return result;
  }

  // UPDATE MY BLOG
  public async agentUpdateMyBog(
    input: BlogDoc,
    blogId: ObjectId,
    memberId: ObjectId
  ): Promise<BlogDoc> {
    const match: T = {
      _id: blogId,
      blogAuthorId: memberId,
      blogStatus: BlogStatus.ACTIVE,
    };
    const result = await this.blogModel.findOneAndUpdate(match, input, {
      new: true,
    });

    if (!result) {
      throw new Errors(HttpCode.NOT_MODIFIELD, Message.UPDATING_FAILED);
    }
    return result;
  }

  ////////////////////////// --- DELETE BLOG ---/////////////////////
  public async deleteMyBlog(
    memberId: ObjectId,
    targetId: ObjectId
  ): Promise<BlogDoc> {
    const match: T = {
      _id: targetId,
      blogAuthorId: memberId,
      blogAuthorType: BlogAuthorType.AGENT,
    };

    const result = await this.blogModel.findOneAndUpdate(
      match,
      {
        $set: { blogStatus: BlogStatus.DELETED },
      },
      { new: true }
    );

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result;
  }

  //////////////////////////// -- MY REVIEWS -- /////////////////////
  public async getMyReviews(
    member: CommonUsers,
    query: CommentsSearchInput
  ): Promise<Comments> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const { page, limit, category, sort } = query;
    const match: T = {
      status: CommentStatus.ACTIVE,
    };
    let second_match: T = {};

    let lookFor: T = {};

    if (category) {
      if (category === CommentTargetType.BLOG) {
        match.targetType = CommentTargetType.BLOG;

        lookFor.$lookup = {
          from: "blogs",
          localField: "targetId",
          foreignField: "_id",
          as: "blog",
        };
        second_match.$match = {
          "blog.blogAuthorId": memberId,
        };
      }
      if (category === CommentTargetType.PROPERTY) {
        match.targetType = CommentTargetType.PROPERTY;

        lookFor.$lookup = {
          from: "properties",
          localField: "targetId",
          foreignField: "_id",
          as: "property",
        };
        second_match.$match = {
          "property.agentId": memberId,
        };
      }
      if (category === CommentTargetType.AGENT) {
        match.targetType = CommentTargetType.AGENT;
        match.targetId = memberId;
      }
    } else {
      match.targetType = CommentTargetType.AGENT;
      match.targetId = memberId;
    }

    const sortComment: T = {
      createdAt: sort === OrderRender.DESC ? -1 : 1,
    };

    const pipeline: any[] = [
      {
        $match: match,
      },
      ...(Object.keys(lookFor).length ? [lookFor] : []),
      ...(Object.keys(second_match).length ? [second_match] : []),
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "senderData",
          pipeline: [
            {
              $project: {
                memberName: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: { path: "$senderData", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          receiverData: 0,
          property: 0,
          blog: 0,
        },
      },
      { $sort: sortComment },

      {
        $facet: {
          comments: [
            {
              $skip: (page - 1) * limit,
            },
            {
              $limit: limit,
            },
          ],
          metaCounter: [{ $count: "total" }],
        },
      },
    ];
    const [result] = await this.commentModel.aggregate(pipeline);

    if (!result.comments.length) {
      return { comments: [], metaCounter: [{ total: 0 }] };
    }

    return result;
  }
}
export default AgentService;
