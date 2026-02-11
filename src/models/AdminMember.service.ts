import CommentModel from "../schema/Comment.model";
import AgencyModel, { Agency } from "../schema/members/Agency.model";
import AgentModel from "../schema/members/Agent.model";
import UserModel from "../schema/members/User.model";
import PropertyModel from "../schema/Property.model";
import Errors, { Message } from "../libs/Errors";
import { HttpCode } from "../libs/Errors";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import TarrifModel, { Tariff } from "../schema/Tariff.model";
import { User, UserInputUpdate, UserMemberInput } from "../libs/types/user";
import TariffService from "./Tariff.service";
import {
  AdminGetAgencyType,
  AdminGetAgentType,
  AdminGetUserType,
  AdminMembers,
  CommonPageInput,
  CommonUsers,
  StatusChangeType,
  T,
} from "../libs/types/common";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { AdminAddTariffInput, TariffInputType } from "../libs/types/payment";
import {
  AdminGetAllMembersCategory,
  AdminGetAllMembersType,
} from "../libs/types/admin";
import mongoose, { Model, ObjectId } from "mongoose";
import { OrderRender } from "../libs/enums/common.enum";
import {
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
import AgencyApplicationModel from "../schema/AgencyApplication.model";
import { AgencyStatus } from "../libs/enums/agency.enum";
import { AgencyApplicationStatus } from "../libs/enums/agencyApplication.enum";
import { ApplicationStatusMessage } from "../libs/enums/agentApplication.enum";

class AdminService {
  private readonly agentModel;
  private readonly agencyModel;
  private readonly userModel;
  private readonly propertyModel;
  private readonly commentProperty;
  public readonly tarrifService;
  private readonly tarrifModel;
  private readonly notificationsModel;
  private readonly agencyApplicationModel;

  constructor() {
    this.agentModel = AgentModel;
    this.agencyModel = AgencyModel;
    this.userModel = UserModel;
    this.propertyModel = PropertyModel;
    this.commentProperty = CommentModel;
    this.tarrifService = new TariffService();
    this.tarrifModel = TarrifModel;
    this.notificationsModel = NotificationModel;
    this.agencyApplicationModel = AgencyApplicationModel;
  }

  /////////////////////////// -- ADMIN SINGUP  -- //////////////////////////////
  public async processSignup(input: UserMemberInput): Promise<User> {
    const exist = await this.userModel
      .findOne({
        role: MemberType.REAL_ESTATE_ADMIN,
        memberStatus: MemberStatus.ACTIVE,
      })
      .lean()
      .exec();

    if (exist) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.ADMIN_EXISTS);
    }
    try {
      const result = await this.userModel.create(input);
      return result;
    } catch (error) {
      console.log("Error in process admin signup: ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  ////////////////////////// ADMIN GET ALL MEMBERS /////////////////////////////
  public async adminGetAllMembers(
    queries: AdminGetAllMembersType,
  ): Promise<AdminMembers> {
    const { limit, page, memberCategory, sort: memberSort, status } = queries;

    // Figure out Model
    const modelMatch: T = {};
    const Models: Record<string, any> = {
      USER: this.userModel,
      AGENT: this.agentModel,
      AGENCY: this.agencyModel,
    };
    if (memberCategory) {
      if (memberCategory?.memberType) {
        modelMatch.role = memberCategory.memberType;
      }
    }

    const currentModel = Models[modelMatch.role];
    if (!currentModel) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_MEMBER_ROLE);
    }

    // Member Match
    const memberMatch: T = { memberStatus: MemberStatus.ACTIVE };

    if (status) {
      memberMatch.memberStatus = status;
    }

    // Sort
    const sort: T = {
      createdAt: -1,
    };

    if (memberSort) {
      sort.createdAt = memberSort === OrderRender.DESC ? -1 : 1;
    }

    // Create project
    const project = this.updateProject(memberCategory!);

    // Sort username
    const usernameMatch: T = {};

    if (memberCategory?.username) {
      usernameMatch.name = {
        $regex: memberCategory.username,
        $options: "i",
      };
    }

    // Search
    const [result] = await currentModel.aggregate([
      {
        $match: memberMatch,
      },
      {
        $sort: sort,
      },
      ...(Object.keys(project).length ? [{ $project: project }] : []),
      ...(memberCategory?.username ? [{ $match: usernameMatch }] : []),
      {
        $facet: {
          members: [
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
    ]);

    // Check
    if (!result.members.length) {
      return {
        members: result.members ?? [],
        metaCounter: result.metaCounter ?? [{ total: 0 }],
      };
    }

    // Return
    return result;
  }

  ////////////////////////////// ADMIN CHANGE MEMBER STATUS ///////////////////////////
  public async adminChangeMemberStatus(
    adminId: ObjectId,
    queries: StatusChangeType<MemberStatus> & { role: MemberType },
  ): Promise<CommonUsers> {
    const { id, status, role } = queries;

    // Check  member status;
    const allowedMemberStatus = Object.values(MemberStatus) as MemberStatus[];
    if (!allowedMemberStatus.includes(status)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_MEMBER_STATUS);
    }

    // Admin Check
    const adminMatch: T = {
      _id: adminId,
      memberStatus: MemberStatus.ACTIVE,
      role: MemberType.REAL_ESTATE_ADMIN,
    };

    const admin = await this.userModel.findOne(adminMatch).lean().exec();

    if (!admin) {
      throw new Errors(HttpCode.FORBIDDEN, Message.ACCESS_DENIED);
    }

    // Find model
    const Models: Record<string, any> = {
      USER: this.userModel,
      AGENT: this.agentModel,
      AGENCY: this.agencyModel,
    };

    const currentModel = Models[role];
    if (!currentModel) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ROLE);
    }

    // Search & Update
    const memberMatch: T = {
      _id: id,
      role,
    };

    const member = await currentModel
      .findOneAndUpdate(
        memberMatch,
        {
          $set: {
            memberStatus: status,
          },
        },
        {
          new: true,
        },
      )
      .lean()
      .exec();

    if (!member) {
      throw new Errors(HttpCode.NOT_MODIFIELD, Message.UPDATING_FAILED);
    }

    // Return
    return member;
  }

  /////////////////// ---- ADMIN NOTIFICATIONS ////////////////
  public async adminGetNotifications(
    adminId: ObjectId,
    queries: CommonPageInput,
  ): Promise<MyNotifications> {
    const { page, limit } = queries;
    const notificationMatch: T = {
      recipientId: adminId,
      recipientRole: MemberType.REAL_ESTATE_ADMIN,
      entityType: NotificationEntityType.AGENCY_APPLICATION,
      type: NotificationType.APPLICATION_SUBMITED,
    };

    const sort: T = {
      createdAt: -1,
    };

    const adminMatch: T = {
      memberStatus: MemberStatus.ACTIVE,
      _id: adminId,
      role: MemberType.REAL_ESTATE_ADMIN,
    };

    const admin = await this.userModel.findOne(adminMatch).lean().exec();

    if (!admin) {
      throw new Errors(HttpCode.FORBIDDEN, Message.ACCESS_DENIED);
    }

    const [result] = await this.notificationsModel.aggregate([
      {
        $match: notificationMatch,
      },
      {
        $sort: sort,
      },
      {
        $lookup: {
          from: "agencyApplications",
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
                agencyId: 1,
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
          from: "agencies",
          let: {
            agencyId: "$application.agencyId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$agencyId"],
                },
              },
            },
            {
              $project: {
                ownerId: "$_id",
                _id: 0,
                ownerType: "$role",
                name: "$memberName",
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
        notifications: result.notifications ?? [],
        metaCounter: result.metaCounter ?? [{ total: 0 }],
      };
    }
    return result;
  }

  /////////////////////////// ---- REVIEW NOTIFICATION --- ///////////////
  public async reviewNotification(
    adminId: ObjectId,
    entityId: string,
  ): Promise<ReviewNotificationType<Agency>> {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const currentSession = { session };
      // Get agency
      const adminMatch: T = {
        _id: adminId,
        memberStatus: MemberStatus.ACTIVE,
        role: MemberType.REAL_ESTATE_ADMIN,
      };
      const admin = await this.userModel
        .findOne(adminMatch, null, currentSession)
        .lean()
        .exec();

      if (!admin) {
        throw new Errors(HttpCode.FORBIDDEN, Message.ACCESS_DENIED);
      }

      const notificationMatch: T = {
        recipientId: adminId,
        recipientRole: MemberType.REAL_ESTATE_ADMIN,
        entityId: shapeIntoMongooseObjectId(entityId),
      };

      const notification = await this.notificationsModel
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
        status: AgencyApplicationStatus.APPLIED,
      };

      const application = await this.agencyApplicationModel
        .findOneAndUpdate(
          applicationMatch,
          {
            $set: {
              status: AgencyApplicationStatus.UNDER_REVIEW,
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

      const agencyMatch: T = {
        _id: application.agencyId,
        memberStatus: MemberStatus.ACTIVE,
        currentStatus: AgencyStatus.PENDING,
      };

      const agency = await this.agencyModel
        .findOne(agencyMatch, null, currentSession)
        .lean()
        .exec();

      if (!agency) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_FOUND);
      }

      await session.commitTransaction();
      return {
        notification,
        member: agency,
      };
    } catch (error) {
      await session.abortTransaction();
      console.log("Error in reviewNotification: ", error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  //////////////////////// ------- ADMIN APPLICATION REJECT-----//////////////////
  public async adminRejectApplication(
    adminId: ObjectId,
    agencyId: ObjectId,
  ): Promise<NotificationOutput> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      const currentSession = { session };

      // Admin validation
      const adminMatch: T = {
        _id: adminId,
        memberStatus: MemberStatus.ACTIVE,
        role: MemberType.REAL_ESTATE_ADMIN,
      };

      const admin = await this.userModel
        .findOne(adminMatch, null, currentSession)
        .lean()
        .exec();

      if (!admin) {
        throw new Errors(HttpCode.FORBIDDEN, Message.ACCESS_DENIED);
      }

      // Check application exists
      const applicationMatch: T = {
        agencyId,
        status: AgencyApplicationStatus.UNDER_REVIEW,
      };

      const application = await this.agencyApplicationModel
        .findOneAndUpdate(
          applicationMatch,
          {
            $set: {
              reviewedAt: new Date(),
              reviewedBy: adminId,
              status: AgencyApplicationStatus.REJECTED,
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
        recipientId: adminId,
        recipientRole: MemberType.REAL_ESTATE_ADMIN,
        entityId: application._id,
        entityType: NotificationEntityType.AGENCY_APPLICATION,
      };

      const rejectedNotification = await this.notificationsModel
        .findOneAndUpdate(
          rejectedNotificationMatch,
          {
            $set: {
              type: NotificationType.APPLICATION_REJECTED,
              payload: {
                rejectorName: "Admin",
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

      const agencyMatch: T = {
        memberStatus: MemberStatus.ACTIVE,
        currentStatus: AgencyStatus.PENDING,
        _id: agencyId,
      };

      const agency = await this.agencyModel
        .findOne(agencyMatch, null, currentSession)
        .lean()
        .exec();

      if (!agency) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_AGENCY_FOUND);
      }

      const newNotificationInput: Partial<NotificationCreation> = {
        actionRequired: false,
        entityId: application._id,
        entityType: NotificationEntityType.AGENCY_APPLICATION,
        recipientId: agency.userId,
        recipientRole: MemberType.USER,
        type: NotificationType.APPLICATION_REJECTED,
        payload: {
          rejectorName: "Admin",
          reason: ApplicationStatusMessage.REJECTED_MESSAGE,
        },
      };

      await this.notificationsModel.create(
        [newNotificationInput],
        currentSession,
      );

      await session.commitTransaction();

      return rejectedNotification;
    } catch (error) {
      await session.abortTransaction();
      console.log("Error in adminRejectApplication: ", error);
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

  //////////////////////////////////// Helper functions /////////////////////////

  public updateProject(memberCategory: AdminGetAllMembersCategory): T {
    if (memberCategory?.memberType === MemberType.USER) {
      return {
        id: "$_id",
        name: "$memberName",
        type: "$role",
        status: "$memberStatus",
        phone: "$memberPhone",
        date: "$createdAt",
        _id: 0,
      };
    }

    if (memberCategory?.memberType === MemberType.AGENT) {
      return {
        id: "$_id",
        name: "$nickname",
        type: "$role",
        status: "$memberStatus",
        phone: 1,
        date: "$createdAt",
        verified: "$isVerified",
        averageRating: 1,
        businessStatus: "$currentStatus",
        licenseNumber: 1,
        _id: 0,
      };
    }
    if (memberCategory?.memberType === MemberType.AGENCY) {
      return {
        id: "$_id",
        name: "$memberName",
        type: "$role",
        status: "$memberStatus",
        phone: "$memberPhone",
        date: "$memberSince",
        verified: "$isVerified",
        businessStatus: "$currentStatus",
        licenseNumber: 1,
        _id: 0,
        registrationNumber: 1,
      };
    }
    return {};
  }
}

export default AdminService;
