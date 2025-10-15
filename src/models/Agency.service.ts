import { CommonUsers, StatisticsModifier, T } from "../libs/types/common";
import { MemberStatus } from "../libs/enums/member.enum";
import { AgencyLocation, AgencyResults } from "../libs/types/agency";
import ViewModel, { ViewDocs } from "../schema/View.model";
import AgencyModel, { Agency } from "../schema/members/Agency.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import { ObjectId } from "mongoose";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";
import chalk from "chalk";
import {
  agentsLookupByAgencyId,
  propertiesLookupByAgencyId,
} from "../libs/config";

class AgencyService {
  private readonly agencyModel;
  private readonly viewModel;
  public readonly viewService;

  constructor() {
    this.agencyModel = AgencyModel;
    this.viewModel = ViewModel;
    this.viewService = new ViewService();
  }
  public async getAgencyByLocation(
    input: AgencyLocation
  ): Promise<AgencyResults> {
    const { page, limit, location } = input;

    const match: T = {
      memberStatus: MemberStatus.ACTIVE,
      address: {
        $regex: location,
        $options: "i",
      },
    };

    const sort: T = {
      createdAt: -1,
      isVerified: -1,
    };

    const [result] = await this.agencyModel.aggregate([
      { $match: match },
      {
        $sort: sort,
      },
      {
        $facet: {
          agencies: [
            { $skip: (page - 1) * limit },
            {
              $limit: limit,
            },
          ],
          metaCounter: [{ $count: "total" }],
        },
      },
    ]);

    console.log("result", result);
    if (!result.agencies) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return {
      agencies: result.agencies,
      totalAgenciesNumber: result.metaCounter[0]?.total || 0,
    };
  }

  public async getAgencyDetail(
    member: CommonUsers,
    agencyId: ObjectId
  ): Promise<Agency> {
    const match: T = {
      memberStatus: MemberStatus.ACTIVE,
      _id: agencyId,
    };

    const target = await this.agencyModel.findOne(match);

    if (!target) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    if (member) {
      const input: ViewInput = {
        userId: member._id!,
        viewGroup: ViewGroup.AGENCY,
        viewTargetId: agencyId,
      };

      const exist: null | ViewDocs = await this.viewService.checkViewExistance(
        input
      );

      if (!exist) {
        await this.viewService.insertUserView(input);

        await this.agencyStatsEditor({
          _id: agencyId,
          targetKey: "views",
          modifier: 1,
        });
      }
    }
    await this.agencyModel.aggregate([
      { $match: match },
      agentsLookupByAgencyId,
      propertiesLookupByAgencyId,

      {
        $addFields: {
          agentsTotalNumber: {
            $size: {
              $ifNull: ["$agentsList", []],
            },
          },
          propertiesTotalNumber: {
            $size: {
              $ifNull: ["$propertiesList", []],
            },
          },
        },
      },
      {
        $addFields: {
          featuredScore: {
            $min: [
              {
                $add: [
                  {
                    $multiply: [{ $ifNull: ["$agentsTotalNumber", 0] }, 0.15],
                  },
                  {
                    $multiply: [
                      { $ifNull: ["$propertiesTotalNumber", 0] },
                      0.15,
                    ],
                  },
                  {
                    $multiply: [
                      {
                        $floor: {
                          $avg: {
                            $map: {
                              input: "$agentsList",
                              as: "c",
                              in: { $ifNull: ["$$c.featuredScore", 0] },
                            },
                          },
                        },
                      },
                      0.5,
                    ],
                  },
                  {
                    $multiply: [{ $ifNull: ["$views", 0] }, 0.2],
                  },
                ],
              },
              10,
            ],
          },
        },
      },
      {
        $addFields: {
          agencyBadge: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      {
                        $gte: ["$featuredScore", 9],
                      },
                      {
                        $eq: ["$isVerified", true],
                      },
                    ],
                  },
                  then: "ELITE AGENCY",
                },
                {
                  case: {
                    $and: [
                      { $gte: ["$featuredScore", 7] },
                      {
                        $eq: ["$isVerified", true],
                      },
                    ],
                  },
                  then: "SUPER AGENCY",
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
                  then: "TOP AGENCY",
                },
              ],
              default: "VERIFIED AGENCY",
            },
          },
        },
      },
      {
        $project: {
          propertiesList: 0,
          agentsList: 0,
        },
      },
      {
        $merge: {
          into: "agencies",
          whenMatched: "merge",
          whenNotMatched: "discard",
        },
      },
    ]);

    const [result] = await this.agencyModel.aggregate([
      {
        $match: match,
      },
      propertiesLookupByAgencyId,
      agentsLookupByAgencyId,
    ]);

    return result;
  }

  private async agencyStatsEditor(input: StatisticsModifier): Promise<Agency> {
    const { targetKey, _id, modifier } = input;

    const result = await this.agencyModel
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

    return result as Agency;
  }
}

export default AgencyService;
