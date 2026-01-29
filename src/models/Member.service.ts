import mongoose, { model, ObjectId } from "mongoose";
import Errors, { Message } from "../libs/Errors";
import {
  UserMemberInput,
  User,
  LoginInput,
  UserInputUpdate,
  UserDashboardOverviewType,
} from "../libs/types/user";
import UserModel from "../schema/members/User.model";
import { HttpCode } from "../libs/Errors";
import AgencyModel, { Agency } from "../schema/members/Agency.model";

import { AgencyInputUpdate, AgencyAggregate } from "../libs/types/agency";
import {
  AgentInputUpdate,
  FeaturedAgentsInput,
  AgentResults,
  MemberAgentInput,
  FeaturedAgentsResult,
} from "../libs/types/agent";
import { Agent } from "../libs/types/agent";
import AgentModel from "../schema/members/Agent.model";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import bcrypt from "bcrypt";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { AgentStatus } from "../libs/enums/agent.enum";
import MessageModel, { MessageDoc } from "../schema/Message.model";
import {
  MessageInput,
  MessagesOutput,
  SenderReceiverType,
} from "../libs/types/message";
import { PropertyType } from "../libs/enums/property.enum";
import {
  CommonPageInput,
  CommonUsers,
  CommonUsersUpdateInput,
  T,
} from "../libs/types/common";
import { CollectionName } from "../libs/enums/message.enum";
import BlogModel from "../schema/Blog.model";
import UserSavingModel from "../schema/UserSaving.model";
import { TargetGroup } from "../libs/enums/userSaving.enum";
import CommentModel from "../schema/Comment.model";
import { CommentStatus } from "../libs/enums/comment.enum";
import { AgencyStatus } from "../libs/enums/agency.enum";
import { MyNotifications } from "../libs/types/notification";
import {
  AgentNotificationEntityType,
  AgentNotificationType,
} from "../libs/enums/notification.enum";
import NotificationModel, {
  NotificationOutput,
} from "../schema/Notification.model";
import { AgentApplicationStatus } from "../libs/enums/agentApplication.enum";
import AgentApplicationModel from "../schema/AgentApplication.model";

class MemberService {
  private readonly userModel;
  private readonly agencyModel;
  private readonly agentModel;
  private readonly messageModel;
  private readonly blogModel;
  private readonly saveModel;
  private readonly commentModel;
  private readonly notificationModel;
  private readonly agentApplicationModel;

  constructor() {
    this.userModel = UserModel;
    this.agencyModel = AgencyModel;
    this.agentModel = AgentModel;
    this.messageModel = MessageModel;
    this.blogModel = BlogModel;
    this.saveModel = UserSavingModel;
    this.commentModel = CommentModel;
    this.notificationModel = NotificationModel;
    this.agentApplicationModel = AgentApplicationModel;
  }

  /////////////////////////// --  GET PUBLIC ADMIN  -- //////////////////////////////
  public async getAdmin(): Promise<User> {
    const match: T = {
      memberStatus: MemberStatus.ACTIVE,
      role: MemberType.REAL_ESTATE_ADMIN,
    };

    const result = await this.userModel.findOne(match).lean().exec();

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return result;
  }

  /////////////////////////// --  MEMBER SIGN UP -- //////////////////////////////
  public async signup(input: UserMemberInput): Promise<User> {
    try {
      const result = (await this.userModel.create(input)).toObject();
      return result;
    } catch (error) {
      console.log("Error in userSignup service model", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  /////////////////////////// --  MEMBER LOGIN -- //////////////////////////////

  public async login(input: LoginInput): Promise<User | Agency | Agent> {
    const { memberEmail, memberPassword } = input;

    const user = await this.userModel
      .findOne(
        {
          memberEmail,
          memberStatus: {
            $ne: MemberStatus.DELETED,
          },
        },
        {
          memberStatus: 1,
          _id: 1,
          memberPassword: 1,
          agentMode: 1,
          agencyMode: 1,
        },
      )
      .lean();

    if (!user) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER);
    }

    if (user.memberStatus === MemberStatus.BLOCKED) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }

    const match = await bcrypt.compare(memberPassword, user.memberPassword);

    if (!match) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }
    if (user.agencyMode === true) {
      const agency = await this.agencyModel
        .findOne({
          userId: user._id,
          currentStatus: AgencyStatus.AVAILABLE,
        })
        .lean();

      if (!agency) {
        throw new Errors(HttpCode.CONFLICT, Message.AGENCY_NOT_ACTIVE);
      }
      return agency;
    }

    if (user.agentMode === true) {
      const agent = await this.agentModel
        .findOne({
          userId: user._id,
          currentStatus: AgentStatus.AVAILABLE,
        })
        .lean();

      if (!agent) {
        throw new Errors(HttpCode.CONFLICT, Message.AGENT_NOT_ACTIVE);
      }
      return agent;
    } else {
      return (await this.userModel.findById(user._id)) as User;
    }
  }

  /////////////////////////// --  GET MEMBER DETAIL -- //////////////////////////////
  public async getMemberDetail(member: CommonUsers): Promise<CommonUsers> {
    // style 1
    const memberId = shapeIntoMongooseObjectId(member._id);

    const Models: T = {
      USER: this.userModel,
      REAL_ESTATE_ADMIN: this.userModel,
      AGENT: this.agentModel,
      AGENCY: this.agencyModel,
    };

    const Model = Models[member.role];
    if (!Model) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ROLE);
    }

    const query: T =
      member.role === MemberType.REAL_ESTATE_ADMIN
        ? {
            role: MemberType.REAL_ESTATE_ADMIN,
            memberStatus: MemberStatus.ACTIVE,
          }
        : { _id: member._id!, memberStatus: MemberStatus.ACTIVE };

    const result = await Model.findOne(query);
    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result;
  }

  /////////////////////////// --  WRITE A MESSAGE -- //////////////////////////////
  public async WriteMessageToMember(
    member: CommonUsers,
    input: MessageInput,
  ): Promise<MessageDoc> {
    const { receiverId, receiverType, senderType } = input;
    const userId = shapeIntoMongooseObjectId(member._id);

    const receiver = await this.getMemberData(receiverType, receiverId!);

    const sender = await this.getMemberData(senderType, userId!);

    const receiverData = this.generateMessageReceiver(receiver);
    const senderData = this.generateMessageSender(sender);
    try {
      const data: MessageInput = {
        ...input,
        senderId: input.senderId ?? userId,
        senderData,
        receiverData,
      };

      const result = await this.messageModel.create(data);
      return result;
    } catch (error) {
      console.log("Error in WriteMessageToMember service: ", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  /////////////////////////// --  GET MEMBER MESSAGES -- //////////////////////////////
  public async getMemberMessages(
    member: CommonUsers,
    query: CommonPageInput,
  ): Promise<MessagesOutput> {
    const userId = shapeIntoMongooseObjectId(member._id);
    const { page, limit } = query;
    const match: T = {
      $or: [
        {
          senderId: userId,
          deletedBySender: false,
        },
        { receiverId: userId, deletedBySender: false },
      ],
    };
    const sort: T = {
      createdAt: -1,
      isRead: 1,
    };

    const [result] = await this.messageModel.aggregate([
      {
        $match: match,
      },
      { $sort: sort },
      {
        $facet: {
          messages: [
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

    if (!result.messages.length) {
      return { messages: [], metaCounter: [{ total: 0 }] };
    }

    return result;
  }

  ////////////////////////// --- EDIT MESSAGE ---/////////////////////
  public async messageEdit(query: T): Promise<MessageDoc> {
    const inTenMins = new Date(Date.now() - 1000 * 60 * 10);
    const { memberId, targetId, content } = query;
    const match: T = {
      _id: targetId,
      senderId: memberId,
      deletedBySender: false,
      createdAt: { $gte: inTenMins },
    };

    const result = await this.messageModel.findOneAndUpdate(
      match,
      {
        $set: { content: content, isEdited: true },
      },
      { new: true },
    );

    if (!result) {
      throw new Errors(HttpCode.FORBIDDEN, Message.EXPIRED_TIME);
    }
    return result;
  }
  ////////////////////////// --- DELETE MESSAGE ---/////////////////////
  public async messageDelete(
    memberId: ObjectId,
    targetId: ObjectId,
  ): Promise<MessageDoc> {
    const match: T = {
      _id: targetId,
      senderId: memberId,
      deletedBySender: false,
    };

    const result = await this.messageModel.findOneAndUpdate(
      match,
      {
        $set: { deletedBySender: true },
      },
      { new: true },
    );

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result;
  }
  //////////////////////////// -- MESSAGE READ -- //////////////////////////////
  public async messageRead(
    member: CommonUsers,
    id: ObjectId,
  ): Promise<MessageDoc> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const match: T = {
      _id: id,
      deletedBySender: false,
      receiverId: memberId,
      isRead: false,
    };

    const result = await this.messageModel.findOneAndUpdate(
      match,
      { $set: { isRead: true }, $currentDate: { whenIsRead: true } },
      { new: true },
    );

    if (!result) {
      throw new Errors(HttpCode.NOT_MODIFIELD, Message.UPDATING_FAILED);
    }

    return result;
  }
  /////////////////////////// -- UPDATE MEMBER -- //////////////////////////////
  public async updateMember(
    member: CommonUsers,
    input: CommonUsersUpdateInput,
  ): Promise<CommonUsers> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    const Models: T = {
      USER: this.userModel,
      REAL_ESTATE_ADMIN: this.userModel,
      AGENT: this.agentModel,
      AGENCY: this.agencyModel,
    };

    const Model = Models[member.role];

    if (!Model) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ROLE);
    }

    const query: T =
      member.role === MemberType.REAL_ESTATE_ADMIN
        ? {
            role: MemberType.REAL_ESTATE_ADMIN,
            memberStatus: MemberStatus.ACTIVE,
          }
        : { _id: member._id!, memberStatus: MemberStatus.ACTIVE };

    const result = await Model.findOneAndUpdate(query, input, { new: true });

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result;
  }

  /////////////////////////// -- USER DASHBOARD OVERVIEW -- //////////////////////////////
  public async userDashboardOverview(
    member: CommonUsers,
  ): Promise<UserDashboardOverviewType> {
    const memberId: ObjectId = shapeIntoMongooseObjectId(member._id);

    const [
      savedPropertiesCount,
      savedArticlesCount,
      followedAgentsCount,
      reviewsCount,
      messagesCount,
    ] = await Promise.all([
      this.saveModel.countDocuments({
        userId: memberId,
        targetGroup: TargetGroup.PROPERTY,
      }),
      this.saveModel.countDocuments({
        userId: memberId,
        targetGroup: TargetGroup.BLOG,
      }),
      this.saveModel.countDocuments({
        userId: memberId,
        targetGroup: TargetGroup.AGENT,
      }),
      this.commentModel.countDocuments({
        userId: memberId,
        status: CommentStatus.ACTIVE,
      }),
      this.messageModel.countDocuments({
        $or: [
          {
            senderId: memberId,
            deletedBySender: false,
          },
          { receiverId: memberId, deletedBySender: false },
        ],
      }),
    ]);

    return {
      savedProperties: {
        total: savedPropertiesCount,
      },
      savedArticles: {
        total: savedArticlesCount,
      },
      followedAgents: {
        total: followedAgentsCount,
      },
      reviews: {
        total: reviewsCount,
      },
      messages: {
        total: messagesCount,
      },
      generatedAt: new Date(),
    };
  }

  //////////////////// - HELPER FUCNTIONS ---//////////////
  private generateMessageReceiver(receiver: CommonUsers): SenderReceiverType {
    if (
      receiver.role === MemberType.USER ||
      receiver.role === MemberType.REAL_ESTATE_ADMIN ||
      receiver.role === MemberType.AGENCY
    ) {
      const receiverData = receiver as User | Agency;
      return {
        name: receiverData.memberName,
        _id: receiverData._id!,
        avatar: receiverData?.avatar,
      };
    } else {
      const receiverData = receiver as Agent;

      return {
        name: receiverData?.fullName,
        _id: receiverData._id,
        avatar: receiverData?.avatar,
      };
    }
  }

  private generateMessageSender(sender: CommonUsers): SenderReceiverType {
    if (
      sender.role === MemberType.USER ||
      sender.role === MemberType.REAL_ESTATE_ADMIN ||
      sender.role === MemberType.AGENCY
    ) {
      const senderData = sender as User | Agency;
      return {
        name: senderData.memberName,
        _id: senderData._id!,
        avatar: senderData?.avatar,
      };
    } else {
      const senderData = sender as Agent;

      return {
        name: senderData?.fullName,
        _id: senderData._id,
        avatar: senderData?.avatar,
      };
    }
  }

  ////////////////////////// - GET MEMBER FULL DATA --- //////////////////
  public async getMemberData(
    role: MemberType,
    id: ObjectId,
  ): Promise<CommonUsers> {
    const MemberModels: T = {
      USER: this.userModel,
      AGENT: this.agentModel,
      AGENCY: this.agencyModel,
      REAL_ESTATE_ADMIN: this.userModel,
    };
    const CurrentModel = MemberModels[role];

    if (!CurrentModel) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.INVALID_ROLE);
    }

    const query =
      role === (MemberType.REAL_ESTATE_ADMIN as string)
        ? {
            role: MemberType.REAL_ESTATE_ADMIN,
            memberStatus: MemberStatus.ACTIVE,
          }
        : {
            _id: shapeIntoMongooseObjectId(id),
            memberStatus: MemberStatus.ACTIVE,
          };

    const member = await CurrentModel.findOne(query).lean().exec();

    if (!member) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return member;
  }

  /////////////////////////// ---- USER NOTIFICATIONS  --- ///////////////
  public async userNotifications(
    userId: ObjectId,
    queries: CommonPageInput,
  ): Promise<MyNotifications> {
    const { page, limit } = queries;

    const notificationMatch: T = {
      recipientId: userId,
      recipientRole: MemberType.USER,
      entityType: AgentNotificationEntityType.AGENT_APPLICATION,
      type: {
        $in: [
          AgentNotificationType.AGENT_APPLICATION_APPROVED,
          AgentNotificationType.AGENT_APPLICATION_REJECTED,
        ],
      },
    };

    const sort: T = {
      createdAt: 1,
    };

    const [result] = await this.notificationModel.aggregate([
      {
        $match: notificationMatch,
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

  //////////////////////// ------- USER  = > AGENT STATUS-----//////////////////
  public async authorizeAgentAccount(
    userId: ObjectId,
    notificationId: ObjectId,
  ): Promise<NotificationOutput> {
    const session = await mongoose.startSession();

    try {
      // Start transaction
      session.startTransaction();
      const currentSession = { session };

      // Check notification exists
      const notificationMatch: T = {
        _id: notificationId,
        recipientId: userId,
        recipientRole: MemberType.USER,
        type: AgentNotificationType.AGENT_APPLICATION_APPROVED,
      };

      const notification = await this.notificationModel
        .findOneAndUpdate(
          notificationMatch,
          {
            $set: {
              actionRequired: false,
              resolvedAt: new Date(),
            },
          },
          { new: true, ...currentSession },
        )
        .lean()
        .exec();

      if (!notification) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NOTIFICATION_NOT_FOUND);
      }

      // Check agent exists
      const agentMatch: T = {
        memberStatus: MemberStatus.ACTIVE,
        currentStatus: AgentStatus.PENDING,
        userId,
      };

      const agent = await this.agentModel
        .findOneAndUpdate(
          agentMatch,
          {
            $set: {
              currentStatus: AgentStatus.AVAILABLE,
              isVerified: true,
            },
          },
          { new: true, ...currentSession },
        )
        .lean()
        .exec();

      if (!agent) {
        throw new Errors(HttpCode.NOT_FOUND, Message.AGENT_NOT_ACTIVE);
      }

      // Check application exists
      const applicationMatch: T = {
        agencyId: agent.agencyId,
        agentId: agent._id,
        status: AgentApplicationStatus.APPROVED,
      };

      const application = await this.agentApplicationModel
        .findOne(applicationMatch, null, currentSession)
        .lean()
        .exec();

      if (!application) {
        throw new Errors(HttpCode.NOT_FOUND, Message.APPLICATION_NOT_FOUND);
      }

      const user = await this.userModel.findOneAndUpdate(
        {
          _id: userId,
          memberStatus: MemberStatus.ACTIVE,
        },
        {
          $set: {
            agentMode: true,
          },
        },
        { new: true, ...currentSession },
      );

      if (!user) {
        throw new Errors(HttpCode.FORBIDDEN, Message.NO_MEMBER_FOUND);
      }

      await session.commitTransaction();

      return notification;
    } catch (error) {
      await session.abortTransaction();
      console.log("Error in authorizeAgentAccount: ", error);
      if (error instanceof Errors) {
        throw error;
      } else {
        throw new Errors(HttpCode.BAD_REQUEST, Message.AGENT_CREATION_FAILED);
      }
    } finally {
      session.endSession();
    }
  }

  //////////////////////// ------- APPROVE AGENT REJECTION-----//////////////////
  public async approveAgentRejection(
    userId: ObjectId,
    notificationId: ObjectId,
  ): Promise<NotificationOutput> {
    const session = await mongoose.startSession();

    try {
      // Start transaction
      session.startTransaction();
      const currentSession = { session };

      // Check notification exists
      const notificationMatch: T = {
        _id: notificationId,
        recipientId: userId,
        recipientRole: MemberType.USER,
        type: AgentNotificationType.AGENT_APPLICATION_REJECTED,
      };

      const notification = await this.notificationModel
        .findOneAndUpdate(
          notificationMatch,
          {
            $set: {
              actionRequired: false,
              resolvedAt: new Date(),
            },
          },
          { new: true, ...currentSession },
        )
        .lean()
        .exec();

      if (!notification) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NOTIFICATION_NOT_FOUND);
      }

      // Check agent exists
      const agentMatch: T = {
        memberStatus: MemberStatus.ACTIVE,
        currentStatus: AgentStatus.PENDING,
        userId,
      };

      const agent = await this.agentModel
        .findOneAndUpdate(
          agentMatch,
          {
            $set: {
              currentStatus: AgentStatus.REJECTED,
              isVerified: false,
            },
          },
          { new: true, ...currentSession },
        )
        .lean()
        .exec();

      if (!agent) {
        throw new Errors(HttpCode.NOT_FOUND, Message.AGENT_NOT_ACTIVE);
      }

      // Check application exists
      const applicationMatch: T = {
        agencyId: agent.agencyId,
        agentId: agent._id,
        entityId: notification.entityId,
        status: AgentApplicationStatus.REJECTED,
      };

      const application = await this.agentApplicationModel
        .findOne(applicationMatch, null, currentSession)
        .lean()
        .exec();

      if (!application) {
        throw new Errors(HttpCode.NOT_FOUND, Message.APPLICATION_NOT_FOUND);
      }

      await session.commitTransaction();

      return notification;
    } catch (error) {
      await session.abortTransaction();
      console.log("Error in approveAgentRejection: ", error);
      if (error instanceof Errors) {
        throw error;
      } else {
        throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
      }
    } finally {
      session.endSession();
    }
  }
}

export default MemberService;
