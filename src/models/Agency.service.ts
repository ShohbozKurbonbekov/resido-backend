import {
  CommonPageInput,
  CommonUsers,
  StatisticsModifier,
  T,
} from "../libs/types/common";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import ViewModel, { ViewDocs } from "../schema/View.model";
import AgencyModel, { Agency } from "../schema/members/Agency.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import mongoose, { ObjectId } from "mongoose";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";
import {
  agentsLookupByAgencyId,
  priceValueField,
  propertiesLookupByAgencyId,
  propertyListingType,
  shapeIntoMongooseObjectId,
} from "../libs/config";
import {
  Agent,
  AgentResults,
  Agents,
  MyAgentsDashboardInput,
  MyAgentsDashboardType,
  SearchByLocationInput,
} from "../libs/types/agent";
import {
  AgencyAgentsApplicationInput,
  AgencyAgePropertiesInput,
  AgencyAgePropertiesResult,
  AgencyDashboardOverviewType,
  AgencyInputs,
  AgencyInputUpdate,
  AgencyResults,
  SearchByLocationAgency,
} from "../libs/types/agency";
import AgentModel, { AgentDoc } from "../schema/members/Agent.model";
import PropertyModel, { Property } from "../schema/Property.model";
import { AgencyStatus, AgencyTargetType } from "../libs/enums/agency.enum";
import { AgentStatus } from "../libs/enums/agent.enum";
import { PropertyStatus } from "../libs/enums/property.enum";
import UserModel from "../schema/members/User.model";
import AgencySubscriptionModel from "../schema/AgencySubscription.model";
import { Blogs } from "../libs/types/blog";
import { BlogAuthorType, BlogStatus } from "../libs/enums/blog.enum";
import BlogModel, { BlogDoc } from "../schema/Blog.model";
import TarrifModel from "../schema/Tariff.model";

import {
  NotificationInput,
  MyNotifications,
  NotificationCreation,
  ReviewNotificationType,
} from "../libs/types/notification";
import {
  NotificationEntityType,
  NotificationType,
} from "../libs/enums/notification.enum";
import NotificationModel, {
  NotificationOutput,
} from "../schema/Notification.model";
import {
  AgentApplicationStatus,
  ApplicationStatusMessage,
} from "../libs/enums/agentApplication.enum";
import AgentApplicationModel from "../schema/AgentApplication.model";
import MessageModel from "../schema/Message.model";
import AgencyApplicationModel, {
  AgencyApplicationOutput,
} from "../schema/AgencyApplication.model";
import { AgencyApplicationStatus } from "../libs/enums/agencyApplication.enum";
import { AgencyApplicationInput } from "../libs/types/agencyApplication";

class AgencyService {
  private readonly agencyModel;
  private readonly viewModel;
  public readonly viewService;
  public readonly agentModel;
  public readonly propertyModel;
  private readonly agencySubscriptionModel;
  private readonly userModel;
  private readonly blogModel;
  private readonly tariffModel;
  private readonly notificationModel;
  private readonly agentApplicationModel;
  private readonly messageModel;
  private readonly agencyApplicationModel;

  constructor() {
    this.agencyModel = AgencyModel;
    this.viewModel = ViewModel;
    this.viewService = new ViewService();
    this.agentModel = AgentModel;
    this.propertyModel = PropertyModel;
    this.agencySubscriptionModel = AgencySubscriptionModel;
    this.userModel = UserModel;
    this.blogModel = BlogModel;
    this.tariffModel = TarrifModel;
    this.notificationModel = NotificationModel;
    this.agentApplicationModel = AgentApplicationModel;
    this.messageModel = MessageModel;
    this.agencyApplicationModel = AgencyApplicationModel;
  }

  // UPDATE AGENCY FIELDS
  static async updateAgencyFields() {
    const match: T = {
      memberStatus: MemberStatus.ACTIVE,
    };
    await AgencyModel.aggregate([
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
            $add: [
              {
                $ifNull: [
                  {
                    $multiply: [
                      {
                        $ln: {
                          $add: [{ $ifNull: ["$agentsTotalNumber", 0] }, 1],
                        },
                      },
                      0.15,
                    ],
                  },
                  0,
                ],
              },
              {
                $ifNull: [
                  {
                    $multiply: [
                      {
                        $ln: {
                          $add: [{ $ifNull: ["$propertiesTotalNumber", 0] }, 1],
                        },
                      },
                      0.15,
                    ],
                  },
                  0,
                ],
              },
              {
                $ifNull: [
                  {
                    $multiply: [
                      {
                        $ln: {
                          $max: [
                            {
                              $avg: {
                                $map: {
                                  input: { $ifNull: ["$agentsList", []] },
                                  as: "c",
                                  in: { $ifNull: ["$$c.averageRating", 0] },
                                },
                              },
                            },
                            1,
                          ],
                        },
                      },
                      0.3,
                    ],
                  },
                  0,
                ],
              },
              {
                $ifNull: [
                  {
                    $multiply: [
                      {
                        $ln: {
                          $max: [
                            {
                              $avg: {
                                $map: {
                                  input: { $ifNull: ["$propertiesList", []] },
                                  as: "c",
                                  in: { $ifNull: ["$$c.averageRating", 0] },
                                },
                              },
                            },
                            1,
                          ],
                        },
                      },
                      0.3,
                    ],
                  },
                  0,
                ],
              },
              {
                $ifNull: [
                  {
                    $multiply: [
                      { $ln: { $add: [{ $ifNull: ["$views", 0] }, 1] } },
                      0.1,
                    ],
                  },
                  0,
                ],
              },
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
  }

  // GET AGENCY BY LOCATION
  public async getAgencyByLocation(
    input: SearchByLocationInput,
  ): Promise<SearchByLocationAgency> {
    const { page, limit, location } = input;
    const match: T = {
      memberStatus: MemberStatus.ACTIVE,
      currentStatus: AgencyStatus.AVAILABLE,
    };

    if (location) {
      match["address"] = {
        $regex: location,
        $options: "i",
      };
    }

    const sort: T = {
      createdAt: -1,
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
          totalNumbers: [{ $count: "total" }],
        },
      },
    ]);

    if (!result.agencies) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result;
  }

  // GET AGENCY DETAIL
  public async getAgencyDetail(
    member: CommonUsers | null,
    agencyId: ObjectId,
  ): Promise<Agency> {
    const match: T = {
      memberStatus: MemberStatus.ACTIVE,
      currentStatus: AgencyStatus.AVAILABLE,
      _id: agencyId,
    };

    const target = await this.agencyModel.findOne(match).lean().exec();

    if (!target) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    if (member) {
      const input: ViewInput = {
        userId: member._id!,
        viewGroup: ViewGroup.AGENCY,
        viewTargetId: agencyId,
      };

      const exist: null | ViewDocs =
        await this.viewService.checkViewExistance(input);

      if (!exist) {
        await this.viewService.insertUserView(input);

        await this.agencyStatsEditor({
          _id: agencyId,
          targetKey: "views",
          modifier: 1,
        });
      }
    }

    const propertyStatus = [
      PropertyStatus.AVAILABLE,
      PropertyStatus.RENTED,
      PropertyStatus.SOLD,
    ];

    const [result] = await this.agencyModel.aggregate([
      {
        $match: match,
      },

      // Properties lookup
      {
        $lookup: {
          from: "properties",
          let: {
            agencyId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$agencyId", "$$agencyId"] },
                    { $in: ["$status", propertyStatus] },
                  ],
                },
              },
            },
            {
              $facet: {
                paginatedProperties: [
                  { $sort: { createdAt: -1 } },
                  {
                    $skip: 0,
                  },
                  {
                    $limit: 4,
                  },
                ],
              },
            },
          ],
          as: "propertiesData",
        },
      },
      {
        $unwind: { path: "$propertiesData", preserveNullAndEmptyArrays: true },
      },

      // Agents Lookup
      {
        $lookup: {
          from: "agents",
          let: {
            agencyId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$agencyId", "$$agencyId"] },
                    { $eq: ["$memberStatus", "ACTIVE"] },
                    { $eq: ["$currentStatus", "available"] },
                  ],
                },
              },
            },
            {
              $facet: {
                paginatedAgents: [
                  { $sort: { createdAt: -1 } },
                  {
                    $skip: 0,
                  },
                  {
                    $limit: 4,
                  },
                ],
              },
            },
          ],
          as: "agentsData",
        },
      },
      {
        $unwind: { path: "$agentsData", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          agencyItems: {
            agents: {
              $ifNull: ["$agentsData.paginatedAgents", []],
            },
            properties: {
              $ifNull: ["$propertiesData.paginatedProperties", []],
            },
          },
        },
      },

      {
        $project: {
          agentsData: 0,
          propertiesData: 0,
        },
      },
    ]);
    return result;
  }

  // UPDATE AGENCY STATISTICS
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
        },
      )

      .exec();

    return result as Agency;
  }
  // GET AGENCY AGENTS AND PROPERTIES
  public async getAgentsProperties(
    agencyId: ObjectId,
    input: AgencyAgePropertiesInput,
  ): Promise<AgencyAgePropertiesResult> {
    console.log(input);
    const { page, limit, location, agencyTarget } = input;

    const match: T = {
      memberStatus: MemberStatus.ACTIVE,
      _id: agencyId,
    };
    const sort: T = {
      createdAt: -1,
    };

    const target = await this.agencyModel.findOne(match);

    if (!target) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    const filter: T = {};

    this.filterAgencyItems(filter, location, agencyTarget!);

    const generalLimitedItemsSearch: Record<string, any>[] =
      this.generateLimitedItemsSearch(filter, sort, { page, limit });

    const generalShortSearch: Record<string, any>[] =
      this.generateShortSearch(filter);

    const lookup =
      agencyTarget === AgencyTargetType.AGENTS
        ? [
            {
              $lookup: {
                from: "agents",
                let: {
                  agencyId: "$_id",
                },
                pipeline: [
                  {
                    $facet: {
                      limitedAgents: [...generalLimitedItemsSearch],
                      totalAgents: [...generalShortSearch],
                    },
                  },
                ],
                as: "agencyAgents",
              },
            },
            {
              $unwind: "$agencyAgents",
            },
            {
              $addFields: {
                paginatedAgents: {
                  $ifNull: ["$agencyAgents.limitedAgents", []],
                },
                agentsTotalNumber: {
                  $size: {
                    $ifNull: ["$agencyAgents.totalAgents", []],
                  },
                },
              },
            },
            {
              $project: {
                agencyAgents: 0,
              },
            },
          ]
        : [
            {
              $lookup: {
                from: "properties",
                let: {
                  agencyId: "$_id",
                },
                pipeline: [
                  {
                    $facet: {
                      paginatedProperties: [...generalLimitedItemsSearch],
                      totalProperties: [...generalShortSearch],
                    },
                  },
                ],
                as: "agencyProperties",
              },
            },
            { $unwind: "$agencyProperties" },
            {
              $addFields: {
                paginatedProperties: {
                  $ifNull: ["$agencyProperties.paginatedProperties", []],
                },
                propertiesTotalNumber: {
                  $size: {
                    $ifNull: ["$agencyProperties.totalProperties", []],
                  },
                },
              },
            },
            {
              $project: {
                agencyProperties: 0,
              },
            },
          ];

    const pipeline: any[] = [{ $match: match }, ...lookup];
    const [result] = await this.agencyModel.aggregate(pipeline);

    return { agency: result };
  }

  // VALIDATION - PREPAYMENT
  public async validationPrePayment(id: ObjectId): Promise<boolean> {
    const match: T = { userId: id, currentStatus: AgencyStatus.PAYMENT };
    const result = await this.agencyModel.findOne(match).lean().exec();

    if (!result) {
      throw new Errors(HttpCode.FORBIDDEN, Message.PAYMENT_NOT_ALLOWED);
    }

    return true;
  }

  // APPLY FOR AGENCY
  public async applyAgency(
    userId: ObjectId,
    input: AgencyInputs,
  ): Promise<AgencyApplicationOutput> {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const currentSession = { session };

      // Get admin  - Transaction - 1
      const admin = await this.userModel
        .findOne(
          {
            role: MemberType.REAL_ESTATE_ADMIN,
            memberStatus: MemberStatus.ACTIVE,
          },
          {
            _id: 1,
          },
          currentSession,
        )
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      if (!admin) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.SYSTEM_PROBLEM);
      }

      // Check agency available - Transition 2
      const target = await this.agencyModel.findOne(
        { userId },
        null,
        currentSession,
      );

      if (target) {
        throw new Errors(HttpCode.CONFLICT, Message.AGENCY_EXISTS);
      }

      // Check Application available -  Transaction 3
      const existingApplication = await this.agencyApplicationModel.findOne(
        {
          userId,
          status: AgencyApplicationStatus.APPLIED,
        },
        null,
        currentSession,
      );

      if (existingApplication) {
        throw new Errors(HttpCode.CONFLICT, Message.APPLICATION_ALREADY_EXISTS);
      }

      // Create agency  - Transction 4
      const [agency] = await this.agencyModel.create(
        [
          {
            ...input,
            userId,
            isVerified: false,
            currentStatus: AgencyStatus.PENDING,
          },
        ],
        currentSession,
      );

      // Create an application -  Transaction 5
      const agencyApplicationInput: AgencyApplicationInput = {
        agencyId: agency._id,
        userId,
      };

      const [agencyApplication] = await this.agencyApplicationModel.create(
        [agencyApplicationInput],
        currentSession,
      );

      // Create a notification Transaction 6
      const notificationInput: NotificationInput = {
        actionRequired: true,
        entityId: agencyApplication._id,
        entityType: NotificationEntityType.AGENCY_APPLICATION,
        recipientId: admin._id,
        recipientRole: MemberType.REAL_ESTATE_ADMIN,
        type: NotificationType.APPLICATION_SUBMITED,
      };

      const notificationAvailable = await this.notificationModel.findOne(
        {
          recipientId: admin._id,
          recipientRole: MemberType.REAL_ESTATE_ADMIN,
          entityId: agencyApplication._id,
          type: NotificationType.APPLICATION_SUBMITED,
        },
        null,
        currentSession,
      );

      if (notificationAvailable) {
        throw new Errors(HttpCode.CONFLICT, Message.NOTIFICATION_ALREADY_SENT);
      }

      await this.notificationModel.create([notificationInput], currentSession);
      await session.commitTransaction();

      return agencyApplication;
    } catch (error) {
      await session.abortTransaction();
      console.log("Error in applyAgency service: ", error);
      if (error instanceof Errors) {
        throw error;
      } else {
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
      }
    } finally {
      session.endSession();
    }
  }

  // UPDATE AGENCY PROFILE
  public async updateAgencyProfile(
    input: AgencyInputUpdate,
    agencyId: ObjectId,
  ): Promise<Agency> {
    const result = await this.agencyModel
      .findOneAndUpdate(
        {
          _id: agencyId,
          memberStatus: MemberStatus.ACTIVE,
          currentStatus: AgencyStatus.AVAILABLE,
        },
        {
          $set: input,
        },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();

    if (!result) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.AGENCY_NOT_ACTIVE);
    }

    return result;
  }

  // AGENCY MY BLOGS
  public async myBlogs(
    member: CommonUsers,
    query: CommonPageInput,
  ): Promise<Blogs> {
    const { page, limit } = query;
    const match: T = {
      blogAuthorId: shapeIntoMongooseObjectId(member._id),
      blogAuthorType: BlogAuthorType.AGENCY,
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

  ////////////////////////// --- AGENCY DELETE BLOG ---/////////////////////
  public async deleteMyBlog(
    memberId: ObjectId,
    targetId: ObjectId,
  ): Promise<BlogDoc> {
    const match: T = {
      _id: targetId,
      blogAuthorId: memberId,
      blogAuthorType: BlogAuthorType.AGENCY,
    };

    const result = await this.blogModel.findOneAndUpdate(
      match,
      {
        $set: { blogStatus: BlogStatus.DELETED },
      },
      { new: true },
    );

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result;
  }

  //////////////////////// ------- AGENTS' APPLICATIONS -----//////////////////
  public async agentsApplications(
    agencyId: ObjectId,
    queries: AgencyAgentsApplicationInput,
  ): Promise<AgentResults> {
    const { page, limit, currentStatus } = queries;
    const agenyMatch: T = {
      _id: agencyId,
      memberStatus: MemberStatus.ACTIVE,
      currentStatus: AgencyStatus.AVAILABLE,
      isVerified: true,
    };
    const agentMatch: T = {
      memberStatus: MemberStatus.ACTIVE,
      agencyId,
    };
    if (currentStatus) {
      agentMatch.currentStatus = currentStatus;
    }

    const sort: T = {
      createdAt: -1,
    };

    const agency = await this.agencyModel.findOne(agenyMatch).lean().exec();
    if (!agency) {
      throw new Errors(HttpCode.FORBIDDEN, Message.AGENCY_NOT_ACTIVE);
    }

    const [result] = await this.agentModel.aggregate([
      {
        $match: agentMatch,
      },
      {
        $sort: sort,
      },
      {
        $facet: {
          agents: [
            { $skip: (page - 1) * limit },
            {
              $limit: limit,
            },
          ],
          totalNumbers: [{ $count: "total" }],
        },
      },
    ]);

    if (!result.agents.length) {
      return {
        agents: [],
        totalNumbers: [{ total: 0 }],
      };
    }
    return result;
  }

  /////////////////////////// ---- AGENT NOTIFICATIONS  --- ///////////////
  public async agencyNotifications(
    agencyId: ObjectId,
    queries: CommonPageInput,
  ): Promise<MyNotifications> {
    const { page, limit } = queries;
    const notificationMatch: T = {
      recipientId: agencyId,
      recipientRole: MemberType.AGENCY,
      entityType: NotificationEntityType.AGENT_APPLICATION,
      type: NotificationType.APPLICATION_SUBMITED,
    };

    const sort: T = {
      createdAt: -1,
    };

    const agencyMatch: T = {
      currentStatus: AgencyStatus.AVAILABLE,
      memberStatus: MemberStatus.ACTIVE,
      _id: agencyId,
    };

    const agency = await this.agencyModel.findOne(agencyMatch).lean().exec();

    if (!agency) {
      throw new Errors(HttpCode.FORBIDDEN, Message.AGENCY_NOT_ACTIVE);
    }

    const [result] = await this.notificationModel.aggregate([
      {
        $match: notificationMatch,
      },
      {
        $lookup: {
          from: "agentApplication",
          let: {
            applicationId: "$entityId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$applicationId"],
                },
              },
            },
            {
              $project: {
                agentId: 1,
              },
            },
          ],
          as: "application",
        },
      },
      {
        $unwind: { path: "$application", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "agents",
          let: {
            agentId: "$application.agentId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$agentId"],
                },
              },
            },
            {
              $project: {
                ownerId: "$_id",
                ownerType: "$role",
                name: "$fullName",
                status: "$currentStatus",
                address: 1,
                avatar: 1,
                createdAt: 1,
              },
            },
          ],
          as: "notificationOwner",
        },
      },
      {
        $unwind: {
          path: "$notificationOwner",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          application: 0,
        },
      },
      {
        $sort: sort,
      },
      {
        $facet: {
          notifications: [
            { $skip: (page - 1) * limit },
            {
              $limit: limit,
            },
          ],
          metaCounter: [{ $count: "total" }],
        },
      },
    ]);

    if (!result.notifications.length) {
      return {
        notifications: [],
        metaCounter: [{ total: 0 }],
      };
    }
    return result;
  }

  /////////////////////////// ---- REVIEW NOTIFICATION --- ///////////////
  public async reviewNotification(
    agencyId: ObjectId,
    entityId: string,
  ): Promise<ReviewNotificationType<AgentDoc>> {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const currentSession = { session };
      // Get agency
      const agencyMatch: T = {
        _id: agencyId,
        memberStatus: MemberStatus.ACTIVE,
        currentStatus: AgencyStatus.AVAILABLE,
      };
      const agency = await this.agencyModel
        .findOne(agencyMatch, null, currentSession)
        .lean()
        .exec();

      if (!agency) {
        throw new Errors(HttpCode.FORBIDDEN, Message.AGENCY_NOT_ACTIVE);
      }

      const notificationMatch: T = {
        recipientId: agency._id,
        recipientRole: MemberType.AGENCY,
        entityId: shapeIntoMongooseObjectId(entityId),
      };

      const notification = await this.notificationModel
        .findOneAndUpdate(
          notificationMatch,
          {
            $set: {
              actionRequired: false,
            },
          },
          {
            new: true,
            runValidators: true,
            ...currentSession,
          },
        )
        .lean()
        .exec();

      if (!notification) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NOTIFICATION_NOT_FOUND);
      }

      const applicationMatch: T = {
        _id: shapeIntoMongooseObjectId(entityId),
        agencyId: agency._id,
        status: AgentApplicationStatus.APPLIED,
      };

      const application = await this.agentApplicationModel
        .findOneAndUpdate(
          applicationMatch,
          {
            $set: {
              status: AgentApplicationStatus.UNDER_REVIEW,
            },
          },

          {
            new: true,
            runValidators: true,
            ...currentSession,
          },
        )
        .lean()
        .exec();

      if (!application) {
        throw new Errors(HttpCode.NOT_FOUND, Message.APPLICATION_NOT_FOUND);
      }

      const agentMatch: T = {
        _id: application.agentId,
        memberStatus: MemberStatus.ACTIVE,
        currentStatus: AgentStatus.PENDING,
        agencyId: agency._id,
      };

      const agent = await this.agentModel
        .findOne(agentMatch, null, currentSession)
        .lean()
        .exec();

      if (!agent) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_FOUND);
      }

      await session.commitTransaction();
      return {
        notification,
        member: agent,
      };
    } catch (error) {
      await session.abortTransaction();
      console.log("Error in reviewNotification: ", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  //////////////////////// ------- AGENT APPLICATION  APPROVE-----//////////////////
  public async agencyApproveApplication(
    agencyId: ObjectId,
    agentId: ObjectId,
  ): Promise<NotificationOutput> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      const currentSession = { session };

      // Agency validation
      const agencyMatch: T = {
        _id: agencyId,
        memberStatus: MemberStatus.ACTIVE,
        currentStatus: AgencyStatus.AVAILABLE,
      };

      const agency = await this.agencyModel
        .findOne(agencyMatch, null, currentSession)
        .lean()
        .exec();

      if (!agency) {
        throw new Errors(HttpCode.FORBIDDEN, Message.AGENCY_NOT_ACTIVE);
      }

      // Check application exists
      const applicationMatch: T = {
        agencyId,
        agentId,
        status: AgentApplicationStatus.UNDER_REVIEW,
      };

      const application = await this.agentApplicationModel
        .findOneAndUpdate(
          applicationMatch,
          {
            $set: {
              reviewedAt: new Date(),
              reviewedBy: agency._id,
              status: AgentApplicationStatus.APPROVED,
            },
          },
          {
            new: true,
            ...currentSession,
          },
        )
        .lean()
        .exec();

      if (!application) {
        throw new Errors(HttpCode.NOT_FOUND, Message.APPLICATION_NOT_FOUND);
      }

      const approvedNotificationMatch = {
        recipientId: agencyId,
        recipientRole: MemberType.AGENCY,
        entityId: application._id,
        entityType: NotificationEntityType.AGENT_APPLICATION,
      };

      const approvedNotification = await this.notificationModel
        .findOneAndUpdate(
          approvedNotificationMatch,
          {
            $set: {
              type: NotificationType.APPLICATION_CONFIRMED,
              actionRequired: false,
              resolvedAt: new Date(),
            },
          },
          { new: true, ...currentSession },
        )
        .lean()
        .exec();

      if (!approvedNotification) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NOTIFICATION_NOT_FOUND);
      }

      const agentMatch: T = {
        memberStatus: MemberStatus.ACTIVE,
        currentStatus: AgentStatus.PENDING,
        _id: agentId,
      };

      const agent = await this.agentModel
        .findOne(agentMatch, null, currentSession)
        .lean()
        .exec();

      if (!agent) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      const newNotificationInput: Partial<NotificationCreation> = {
        actionRequired: true,
        entityId: application._id,
        entityType: NotificationEntityType.AGENT_APPLICATION,
        recipientId: agent.userId,
        recipientRole: MemberType.USER,
        type: NotificationType.APPLICATION_APPROVED,
        payload: {
          actorName: agency.memberName,
          reason: ApplicationStatusMessage.APPROVED_MESSAGE,
        },
      };

      await this.notificationModel.create(
        [newNotificationInput],
        currentSession,
      );

      await session.commitTransaction();

      return approvedNotification;
    } catch (error) {
      await session.abortTransaction();
      console.log("Error in agencyApproveApplication: ", error);
      if (error instanceof Errors) {
        throw error;
      } else {
        throw new Errors(
          HttpCode.BAD_REQUEST,
          Message.APPLICATION_APPROVE_FAILED,
        );
      }
    } finally {
      session.endSession();
    }
  }

  //////////////////////// ------- AGENT APPLICATION REJECT-----//////////////////
  public async agencyRejectApplication(
    agencyId: ObjectId,
    agentId: ObjectId,
  ): Promise<NotificationOutput> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      const currentSession = { session };

      // Agency validation
      const agencyMatch: T = {
        _id: agencyId,
        memberStatus: MemberStatus.ACTIVE,
        currentStatus: AgencyStatus.AVAILABLE,
      };

      const agency = await this.agencyModel
        .findOne(agencyMatch, null, currentSession)
        .lean()
        .exec();

      if (!agency) {
        throw new Errors(HttpCode.FORBIDDEN, Message.AGENCY_NOT_ACTIVE);
      }

      // Check application exists
      const applicationMatch: T = {
        agencyId,
        agentId,
        status: AgentApplicationStatus.UNDER_REVIEW,
      };

      const application = await this.agentApplicationModel
        .findOneAndUpdate(
          applicationMatch,
          {
            $set: {
              reviewedAt: new Date(),
              reviewedBy: agency._id,
              status: AgentApplicationStatus.REJECTED,
              rejectionReason: ApplicationStatusMessage.REJECTED_MESSAGE,
            },
          },
          {
            new: true,
            ...currentSession,
          },
        )
        .lean()
        .exec();

      if (!application) {
        throw new Errors(HttpCode.NOT_FOUND, Message.APPLICATION_NOT_FOUND);
      }

      const rejectedNotificationMatch = {
        recipientId: agencyId,
        recipientRole: MemberType.AGENCY,
        entityId: application._id,
        entityType: NotificationEntityType.AGENT_APPLICATION,
      };

      const rejectedNotification = await this.notificationModel
        .findOneAndUpdate(
          rejectedNotificationMatch,
          {
            $set: {
              type: NotificationType.APPLICATION_REJECTED,
              payload: {
                actorName: agency.memberName,
                reason: ApplicationStatusMessage.REJECTED_MESSAGE,
              },
              actionRequired: false,
              resolvedAt: new Date(),
            },
          },
          { new: true, ...currentSession },
        )
        .lean()
        .exec();

      if (!rejectedNotification) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NOTIFICATION_NOT_FOUND);
      }

      const agentMatch: T = {
        memberStatus: MemberStatus.ACTIVE,
        currentStatus: AgentStatus.PENDING,
        _id: agentId,
      };

      const agent = await this.agentModel
        .findOne(agentMatch, null, currentSession)
        .lean()
        .exec();

      if (!agent) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_AGENT_FOUND);
      }
      const newNotificationInput: Partial<NotificationCreation> = {
        actionRequired: false,
        entityId: application._id,
        entityType: NotificationEntityType.AGENT_APPLICATION,
        recipientId: agent.userId,
        recipientRole: MemberType.USER,
        type: NotificationType.APPLICATION_REJECTED,
        payload: {
          actorName: agency.memberName,
          reason: ApplicationStatusMessage.REJECTED_MESSAGE,
        },
      };

      await this.notificationModel.create(
        [newNotificationInput],
        currentSession,
      );

      await session.commitTransaction();

      return rejectedNotification;
    } catch (error) {
      await session.abortTransaction();
      console.log("Error in agencyRejectApplication: ", error);
      if (error instanceof Errors) {
        throw error;
      } else {
        throw new Errors(
          HttpCode.BAD_REQUEST,
          Message.APPLICATION_REJECTION_FAILED,
        );
      }
    } finally {
      session.endSession();
    }
  }

  ////////////////////////--- CHANGE PROPERTY STATUS OF AGENCY ----- ///////////////////////
  public async changeAgencyPropertyStatus(
    agencyId: ObjectId,
    queries: T,
  ): Promise<Property> {
    const session = await mongoose.startSession();
    const { propertyId, status } = queries;
    const agencyMatch: T = {};

    const agency = await this.agencyModel.findOne(agencyMatch).lean().exec();
    if (!agency) {
      throw new Errors(HttpCode.FORBIDDEN, Message.AGENCY_NOT_ACTIVE);
    }

    try {
      session.startTransaction();
      const currentSession = { session };

      const propertyMatch: T = {
        _id: propertyId,
        agencyId,
        status: {
          $in: [PropertyStatus.PENDING_APPROVAL, PropertyStatus.AVAILABLE],
        },
      };

      const result = await this.propertyModel.findOneAndUpdate(
        propertyMatch,
        {
          $set: {
            status,
          },
        },
        {
          new: true,
          runValidators: true,
          ...currentSession,
        },
      );
      if (!result) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }
      // Update fields
      if (status === PropertyStatus.AVAILABLE) {
        await this.agencyModel.updateOne(
          { _id: result.agencyId },
          {
            $inc: { propertiesTotalNumber: 1 },
          },
          currentSession,
        );

        await this.agentModel.updateOne(
          {
            _id: result.agentId,
          },
          {
            $inc: { totalProperties: 1 },
          },
          currentSession,
        );
      }

      if (status === PropertyStatus.ARCHIVED) {
        await this.agencyModel.updateOne(
          { _id: agency._id },
          {
            $inc: { propertiesTotalNumber: -1 },
          },
          currentSession,
        );

        await this.agentModel.updateOne(
          {
            _id: result.agentId,
          },
          {
            $inc: { totalProperties: -1 },
          },
          currentSession,
        );
      }
      await session.commitTransaction();
      return result;
    } catch (error) {
      console.log("Error changeAgencyPropertyStatus: ", error);
      await session.abortTransaction();
      if (error instanceof Errors) {
        throw error;
      } else {
        throw new Errors(HttpCode.NOT_MODIFIELD, Message.UPDATING_FAILED);
      }
    } finally {
      session.endSession();
    }
  }

  //////////////////////// --- DASHBOARD AGENCY MY AGENTS --- ///////////////////////////
  public async dashboardMyAgents(
    queries: MyAgentsDashboardInput & {
      agencyId: ObjectId;
    },
  ): Promise<Agents<MyAgentsDashboardType>> {
    // Destructure variables
    const { agencyId, status, limit, page } = queries;

    // Check agency existance
    const agencyMatch: T = {
      memberStatus: MemberStatus.ACTIVE,
      currentStatus: AgencyStatus.AVAILABLE,
      _id: agencyId,
    };

    const agency = await this.agencyModel.findOne(agencyMatch).lean().exec();

    if (!agency) {
      throw new Errors(HttpCode.FORBIDDEN, Message.AGENCY_NOT_ACTIVE);
    }

    // Filter
    const agentMatch: T = {
      agencyId,
      memberStatus: MemberStatus.ACTIVE,
      currentStatus: status as AgentStatus,
    };

    // Sort
    const sort: T = {
      createdAt: -1,
    };

    // Search
    const [result] = await this.agentModel.aggregate([
      {
        $match: agentMatch,
      },
      {
        $sort: sort,
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          nickname: 1,
          fullName: 1,
          avatar: 1,
          currentStatus: 1,
          memberStatus: 1,
          agentMode: 1,
          isVerified: 1,
        },
      },
      {
        $facet: {
          agents: [
            { $skip: (page - 1) * limit },
            {
              $limit: limit,
            },
          ],
          totalNumbers: [{ $count: "total" }],
        },
      },
    ]);

    // If No result  return =>
    if (!result.agents.length) {
      return { agents: [], totalNumbers: [{ total: 0 }] };
    }

    // Return
    return result;
  }

  ////////////////////////////// AGENCY SUSPEND AGENT ///////////////////////////
  public async changeAgentStatus(
    agencyId: ObjectId,
    queries: T,
  ): Promise<AgentDoc> {
    const { agentId, status } = queries;

    const agencyMatch: T = {
      _id: agencyId,
      memberStatus: MemberStatus.ACTIVE,
      currentStatus: AgencyStatus.AVAILABLE,
    };

    const agency = await this.agencyModel.findOne(agencyMatch).lean().exec();

    if (!agency) {
      throw new Errors(HttpCode.FORBIDDEN, Message.AGENCY_NOT_ACTIVE);
    }

    const agentMatch: T = {
      _id: agentId,
      agencyId: agency._id,
    };

    const agent = await this.agentModel.findOneAndUpdate(
      agentMatch,
      {
        $set: {
          currentStatus: status,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!agent) {
      throw new Errors(HttpCode.NOT_MODIFIELD, Message.NO_AGENT_FOUND);
    }
    return agent;
  }

  //////////////////////////////// ------------ AGENCY DASHBOARD OVERVIEW -------- ///////////////////
  public async agencyDashboardOverview(
    agencyId: ObjectId,
  ): Promise<AgencyDashboardOverviewType> {
    // Agency existance
    const agencyMatch: T = {
      _id: agencyId,
      memberStatus: MemberStatus.ACTIVE,
      currentStatus: {
        $in: [AgencyStatus.AVAILABLE, AgencyStatus.PAUSED],
      },
    };

    const agency = await this.agencyModel.findOne(agencyMatch).lean().exec();

    if (!agency) {
      throw new Errors(HttpCode.FORBIDDEN, Message.AGENCY_NOT_ACTIVE);
    }

    // Subscription existance
    const subscriptionMatch: T = {
      agencyId,
    };

    const sort: T = {
      createdAt: -1,
    };

    const subscription = await this.agencySubscriptionModel
      .findOne(subscriptionMatch)
      .sort(sort);

    if (!subscription) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_ACTIVE_SUBSCRIPTION);
    }

    // Fetch data countss
    const [
      myPropertiesCount,
      myNotificationsCount,
      myAgentsCount,
      myBlogsCount,
      messagesCount,
      totalViewsCount,

      // TO-DO FOR TRANSACTION
    ] = await Promise.all([
      this.propertyModel.countDocuments({
        agencyId,
        status: {
          $nin: [PropertyStatus.DELETED, PropertyStatus.DRAFT],
        },
      }),
      this.notificationModel.countDocuments({
        recipientId: agencyId,

        recipientRole: BlogAuthorType.AGENCY,
        resolvedAt: { $exists: false },
      }),
      this.agentModel.countDocuments({
        agencyId,
        memberStatus: MemberStatus.ACTIVE,
        currentStatus: {
          $in: [
            AgentStatus.AVAILABLE,
            AgentStatus.PAUSED,
            AgentStatus.REJECTED,
          ],
        },
      }),
      this.blogModel.countDocuments({
        blogAuthorId: agencyId,
        blogAuthorType: BlogAuthorType.AGENCY,
        blogStatus: { $ne: BlogStatus.DELETED },
      }),

      this.messageModel.countDocuments({
        $or: [
          {
            senderId: agencyId,
            deletedBySender: false,
          },
          { receiverId: agencyId, deletedBySender: false },
        ],
      }),

      // TO-DO  later => transactions;
      this.viewModel.countDocuments({
        viewTargetId: agencyId,
        viewGroup: ViewGroup.AGENCY,
      }),
    ]);

    return {
      myProperties: {
        total: myPropertiesCount,
      },
      myAgents: {
        total: myAgentsCount,
      },
      myBillingInfo: {
        subscriptionPlanType: subscription.billingSnapshot.name,
        subscriptionStatus: subscription.subscriptionStatus,
      },
      myNotifications: {
        total: myNotificationsCount,
      },
      myBlogs: {
        total: myBlogsCount,
      },

      messages: {
        total: messagesCount,
      },
      totalViews: {
        total: totalViewsCount,
      },
      generatedAt: new Date(),
    };
  }
  //  HELPER  FUNCTIONS
  private filterAgencyItems(
    filter: T,
    location: string | undefined,
    agencyTarget: AgencyTargetType,
  ): void {
    //  AGENT FILTER
    if (agencyTarget === AgencyTargetType.AGENTS) {
      ((filter.currentStatus = AgentStatus.AVAILABLE),
        (filter.memberStatus = MemberStatus.ACTIVE));

      if (location) {
        filter.address = {
          $regex: location,
          $options: "i",
        };
      }
    }

    // PROPERTY FILTER
    if (agencyTarget === AgencyTargetType.PROPERTIES) {
      filter.status = {
        $in: [
          PropertyStatus.AVAILABLE,
          PropertyStatus.RENTED,
          PropertyStatus.SOLD,
        ],
      };

      if (location) {
        filter.$or = [
          { "address.street": { $regex: location, $options: "i" } },
          {
            "address.district": { $regex: location, $options: "i" },
          },
          {
            "address.city": { $regex: location, $options: "i" },
          },
          { "address.country": { $regex: location, $options: "i" } },
        ];
      }
    }
  }

  private generateLimitedItemsSearch = (
    filter: T,
    sort: T,
    input: CommonPageInput,
  ) => {
    const { page, limit } = input;
    return [
      {
        $match: {
          $expr: {
            $eq: ["$agencyId", "$$agencyId"],
          },
          ...filter,
        },
      },
      {
        $sort: sort,
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ];
  };
  private generateShortSearch = (filter: T) => {
    return [
      {
        $match: {
          $expr: {
            $eq: ["$agencyId", "$$agencyId"],
          },
          ...filter,
        },
      },
    ];
  };
}

export default AgencyService;
