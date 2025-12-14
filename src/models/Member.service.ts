import mongoose, { model, ObjectId } from "mongoose";
import Errors, { Message } from "../libs/Errors";
import {
  UserMemberInput,
  User,
  LoginInput,
  UserInputUpdate,
} from "../libs/types/user";
import UserModel from "../schema/members/User.model";
import { HttpCode } from "../libs/Errors";
import AgencyModel, { Agency } from "../schema/members/Agency.model";

import { AgencyInputUpdate, AgencyMemberInput } from "../libs/types/agency";
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
import { MessageInput, MessagesOutput } from "../libs/types/message";
import { PropertyType } from "../libs/enums/property.enum";
import {
  CommonPageInput,
  CommonUsers,
  CommonUsersUpdateInput,
  T,
} from "../libs/types/common";
import { CollectionName } from "../libs/enums/message.enum";

class MemberService {
  private readonly userModel;
  private readonly agencyModel;
  private readonly agentModel;
  private readonly messageModel;

  constructor() {
    this.userModel = UserModel;
    this.agencyModel = AgencyModel;
    this.agentModel = AgentModel;
    this.messageModel = MessageModel;
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
  public async signup(
    input: UserMemberInput | AgencyMemberInput | MemberAgentInput
  ): Promise<CommonUsers> {
    try {
      let result;
      if (
        input.role === MemberType.USER ||
        input.role === MemberType.REAL_ESTATE_ADMIN
      ) {
        result = await this.userModel.create(input);
      } else if (input.role === MemberType.AGENCY) {
        result = await this.agencyModel.create(input);
      } else {
        result = await this.agentModel.create(input);
      }

      return result.toObject();
    } catch (error) {
      console.log("Error in userSignup service model", error);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATING_FAILED);
    }
  }

  /////////////////////////// --  MEMBER LOGIN -- //////////////////////////////

  public async login(input: LoginInput): Promise<User | Agency | Agent> {
    let member: null | Agency | Agent | User = null;
    const memberUser: null | User = await this.userModel.findOne(
      {
        memberEmail: input.memberEmail,
        memberStatus: { $ne: MemberStatus.DELETED },
      },
      {
        memberPassword: 1,
        memberStatus: 1,
        _id: 1,
      }
    );
    const memberAgent: null | Agent = await this.agentModel.findOne(
      {
        memberEmail: input.memberEmail,
        memberStatus: { $ne: MemberStatus.DELETED },
      },
      {
        memberPassword: 1,
        memberStatus: 1,
        _id: 1,
      }
    );
    const memberAgency: null | Agency = await this.agencyModel
      .findOne(
        {
          memberEmail: input.memberEmail,
          memberStatus: { $ne: MemberStatus.DELETED },
        },
        {
          memberPassword: 1,
          memberStatus: 1,
          _id: 1,
        }
      )
      .exec();

    if (memberUser) member = memberUser;
    if (memberAgency) member = memberAgency;
    if (memberAgent) member = memberAgent;

    if (!member) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER);
    } else if (member.memberStatus === MemberStatus.BLOCKED) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }
    const isMatch: boolean = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );

    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }

    let result: User | Agent | Agency | null = null;

    const resultUser: null | User = await this.userModel
      .findById(member?._id)
      .lean()
      .exec();
    const resultAgent: null | Agent = await this.agentModel
      .findById(member?._id)
      .lean()
      .exec();
    const resultAgency: null | Agency = await this.agencyModel
      .findById(member?._id)
      .lean()
      .exec();

    if (resultUser) {
      result = resultUser;
    } else if (resultAgent) {
      result = resultAgent;
    } else if (resultAgency) {
      result = resultAgency;
    }

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER);
    }
    return result;
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
    input: MessageInput
  ): Promise<MessageDoc> {
    const { receiverId, receiverType } = input;
    const userId = shapeIntoMongooseObjectId(member._id);

    const receiverModel: T = {
      USER: this.userModel,
      AGENT: this.agentModel,
      AGENCY: this.agencyModel,
      REAL_ESTATE_ADMIN: this.userModel,
    };

    const Model = receiverModel[receiverType];

    if (!Model) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ROLE);
    }

    const query =
      receiverType === (MemberType.REAL_ESTATE_ADMIN as string)
        ? {
            role: MemberType.REAL_ESTATE_ADMIN,
            memberStatus: MemberStatus.ACTIVE,
          }
        : { _id: receiverId, memberStatus: MemberStatus.ACTIVE };

    const receiver = await Model.findOne(query);
    const receiverCollectionName: CollectionName =
      this.findCollectionName(receiver);
    const senderCollectionName: CollectionName =
      this.findCollectionName(member);

    if (!receiver) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_MESSAGE_TO_MEMBER);
    }

    try {
      const data: MessageInput = {
        ...input,
        senderId: input.senderId ?? userId,
        senderCollectionName,
        receiverCollectionName,
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
    query: CommonPageInput
  ): Promise<MessagesOutput> {
    const userId = shapeIntoMongooseObjectId(member._id);
    const { page, limit } = query;
    const match: T = {
      $or: [
        {
          senderId: userId,
          deletedBySender: false,
        },
        { receiverId: userId, deletedByReceiver: false },
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
            ...this.lookupSenderReceiver(
              "senderId",
              "senderUser",
              "senderAgent",
              "senderAgency"
            ),
            ...this.lookupSenderReceiver(
              "receiverId",
              "receiverUser",
              "receiverAgent",
              "receiverAgency"
            ),
            {
              $addFields: {
                senderData: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$senderCollectionName", "users"] },
                        then: { $arrayElemAt: ["$senderUser", 0] },
                      },
                      {
                        case: { $eq: ["$senderCollectionName", "agents"] },
                        then: { $arrayElemAt: ["$senderAgent", 0] },
                      },
                      {
                        case: { $eq: ["$senderCollectionName", "agencies"] },
                        then: { $arrayElemAt: ["$senderAgency", 0] },
                      },
                    ],
                    default: null,
                  },
                },
                receiverData: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$receiverCollectionName", "users"] },
                        then: { $arrayElemAt: ["$receiverUser", 0] },
                      },
                      {
                        case: { $eq: ["$receiverCollectionName", "agents"] },
                        then: { $arrayElemAt: ["$receiverAgent", 0] },
                      },
                      {
                        case: { $eq: ["$receiverCollectionName", "agencies"] },
                        then: { $arrayElemAt: ["$receiverAgency", 0] },
                      },
                    ],
                    default: null,
                  },
                },
              },
            },
            {
              $project: {
                senderUser: 0,
                senderAgent: 0,
                senderAgency: 0,
                receiverUser: 0,
                receiverAgent: 0,
                receiverAgency: 0,
              },
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

  ////////////////////////// --- DELETE MESSAGE ---/////////////////////
  public async messageDelete(
    memberId: ObjectId,
    targetId: ObjectId
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
      { new: true }
    );

    if (!result) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }
    return result;
  }
  //////////////////////////// -- MESSAGE READ -- //////////////////////////////
  public async messageRead(
    member: CommonUsers,
    id: ObjectId
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
      { new: true }
    );

    if (!result) {
      throw new Errors(HttpCode.NOT_MODIFIELD, Message.UPDATING_FAILED);
    }

    return result;
  }
  /////////////////////////// -- UPDATE MEMBER -- //////////////////////////////
  public async updateMember(
    member: CommonUsers,
    input: CommonUsersUpdateInput
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

  private findCollectionName(member: CommonUsers): CollectionName {
    if (member.role === MemberType.AGENCY) {
      return CollectionName.Agency;
    }
    if (member.role === MemberType.AGENT) {
      return CollectionName.Agent;
    }
    return CollectionName.User;
  }

  private lookupSenderReceiver(
    localField: string,
    lookupData1: string,
    lookupData2: string,
    lookupData3: string
  ) {
    return [
      {
        $lookup: {
          from: "users",
          localField: localField,
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: "$memberName",
                avatar: 1,
                description: "$memberDescription",
              },
            },
          ],
          as: lookupData1,
        },
      },
      {
        $lookup: {
          from: "agents",
          localField: localField,
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: "$fullName",
                avatar: 1,
                description: "$bioInfo",
              },
            },
          ],
          as: lookupData2,
        },
      },
      {
        $lookup: {
          from: "agencies",
          localField: localField,
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: "$memberName",
                avatar: 1,
                description: "$bioInfo",
              },
            },
          ],
          as: lookupData3,
        },
      },
    ];
  }
}

export default MemberService;
