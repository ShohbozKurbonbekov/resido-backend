import { Agent, AgentLocation, AgentResults } from "../libs/types/agent";
import AgentModel from "../schema/members/Agent.model";
import { CommonUsers, StatisticsModifier, T } from "../libs/types/common";
import { MemberStatus } from "../libs/enums/member.enum";
import Errors, { HttpCode } from "../libs/Errors";
import { Message } from "../libs/Errors";
import { ObjectId } from "mongoose";
import { addTotCommentsAvRatingFields, commentLookup } from "../libs/config";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";
import { ViewDocs } from "../schema/View.model";
import { LikeInput } from "../libs/types/like";
import { LikeGroup } from "../libs/enums/like.enum";
import LikeService from "./Like.service";

class AgentService {
  private readonly agentModel;
  public readonly viewService;
  public readonly likeService;

  constructor() {
    this.agentModel = AgentModel;
    this.viewService = new ViewService();
    this.likeService = new LikeService();
  }

  // GET AGENTS BY LOCATION

  public async getAgentByLocation(input: AgentLocation): Promise<AgentResults> {
    const filter: T = {
      memberStatus: MemberStatus.ACTIVE,
      address: { $regex: input.location, $options: "i" },
    };
    const sort: T = {
      featuredScore: -1,
      isVerified: -1,
    };

    const [result] = await this.agentModel.aggregate([
      {
        $match: filter,
      },
      { $sort: sort },
      {
        $facet: {
          agents: [
            {
              $skip: (input.page - 1) * input.limit,
            },
            { $limit: input.limit },
          ],
          metaCounter: [{ $count: "total" }],
        },
      },
    ]);

    if (!result.agents.length) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    console.log("result", result);
    return {
      agents: result.agents,
      totalAgentsNumber: result.metaCounter[0].total || 0,
    };
  }

  public async getAgentDetail(
    agentId: ObjectId,
    member: CommonUsers
  ): Promise<Agent> {
    const match: T = {
      _id: agentId,
      memberStatus: MemberStatus.ACTIVE,
    };

    await this.agentModel.aggregate([
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
                $multiply: [{ $ifNull: ["$views", 0] }, 0.05],
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

    if (member) {
      const input: ViewInput = {
        userId: member._id,
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

    let [result] = await this.agentModel.aggregate([
      { $match: match },
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
                      $ifNull: ["$$prop.sellingOption.optionSell.type", ""],
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
    return result;
  }

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

  public async likeTargetAgent(
    userId: ObjectId,
    agentId: ObjectId
  ): Promise<Agent> {
    const target = await this.agentModel.findOne({
      _id: agentId,
      memberStatus: MemberStatus.ACTIVE,
    });

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

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return result;
  }
}
export default AgentService;
